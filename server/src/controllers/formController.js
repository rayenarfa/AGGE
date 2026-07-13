import { prisma } from '../prisma/client.js';
import { verifyToken } from '../utils/auth.js';
import { createContactMessageSchema } from '../validators/formValidators.js';

/**
 * Retrieve form configuration schema by key
 */
export async function getFormDefinition(req, res) {
  try {
    const { key } = req.params;

    const formDefinition = await prisma.formDefinition.findUnique({
      where: { key },
    });

    if (!formDefinition) {
      return res.status(404).json({ error: 'Form definition not found' });
    }

    return res.status(200).json({ formDefinition });
  } catch (error) {
    console.error('Fetch form definition error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Submit dynamic form data
 */
export async function submitForm(req, res) {
  try {
    const { key } = req.params;
    const { email, data } = req.body;

    const formDefinition = await prisma.formDefinition.findUnique({
      where: { key },
    });

    if (!formDefinition) {
      return res.status(404).json({ error: 'Form definition not found' });
    }

    // Dynamic Server-side Validation
    const fields = formDefinition.fields;
    const validationErrors = [];

    fields.forEach((field) => {
      const val = data?.[field.name];

      // Required Check
      if (field.required) {
        if (val === undefined || val === null || String(val).trim() === '') {
          validationErrors.push({
            field: field.name,
            message: `${field.label || field.name} is required`,
          });
          return;
        }
      }

      // Email Format Check
      if (val && field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(val))) {
          validationErrors.push({
            field: field.name,
            message: `Invalid email address format in ${field.label || field.name}`,
          });
        }
      }

      // Number Format Check
      if (val && field.type === 'number') {
        if (isNaN(Number(val))) {
          validationErrors.push({
            field: field.name,
            message: `${field.label || field.name} must be a number`,
          });
        }
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors,
      });
    }

    // Identify user if logged in
    let userId = null;
    let submissionEmail = email || null;

    const token = req.cookies.access_token;
    if (token) {
      try {
        const decoded = verifyToken(token);
        userId = decoded.userId;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          submissionEmail = user.email;
        }
      } catch (err) {
        // Ignore invalid token, threat as guest
      }
    }

    if (!userId && !submissionEmail) {
      return res.status(400).json({ error: 'An email is required for guest submissions' });
    }

    // Save Submission
    const submission = await prisma.formSubmission.create({
      data: {
        formDefinitionId: formDefinition.id,
        userId,
        email: submissionEmail,
        data,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'FORM_SUBMISSION',
        entityType: 'FormSubmission',
        entityId: submission.id,
        details: `Submitted form: ${formDefinition.title} for ${submissionEmail}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      },
    });

    return res.status(201).json({
      message: 'Form submitted successfully',
      submission,
    });
  } catch (error) {
    console.error('Submit form error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Submit general contact/support queries
 */
export async function submitContactMessage(req, res) {
  try {
    const validation = createContactMessageSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.format(),
      });
    }

    const { name, email, subject, message, type } = validation.data;

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        type,
      },
    });

    return res.status(201).json({
      message: 'Contact message saved successfully',
      contactMessage,
    });
  } catch (error) {
    console.error('Submit contact message error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * List all form submissions (Admin only)
 */
export async function getSubmissions(req, res) {
  try {
    const submissions = await prisma.formSubmission.findMany({
      include: {
        formDefinition: {
          select: {
            key: true,
            title: true,
          },
        },
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ submissions });
  } catch (error) {
    console.error('Fetch submissions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Modify status of submission (Admin only)
 */
export async function updateSubmissionStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status parameter' });
    }

    const submission = await prisma.formSubmission.findUnique({
      where: { id },
      include: { formDefinition: true },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Form submission not found' });
    }

    const updated = await prisma.formSubmission.update({
      where: { id },
      data: { status },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'UPDATE_SUBMISSION_STATUS',
        entityType: 'FormSubmission',
        entityId: id,
        details: `Updated submission status of ${submission.email} for ${submission.formDefinition.title} to ${status}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      },
    });

    return res.status(200).json({
      message: 'Submission status updated successfully',
      submission: updated,
    });
  } catch (error) {
    console.error('Update submission status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * List all contact messages (Admin only)
 */
export async function getContactMessages(req, res) {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ messages });
  } catch (error) {
    console.error('Fetch contact messages error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Modify status of contact message (Admin only)
 */
export async function updateContactMessageStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['UNREAD', 'READ', 'REPLIED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status parameter' });
    }

    const message = await prisma.contactMessage.findUnique({ where: { id } });
    if (!message) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status },
    });

    return res.status(200).json({
      message: 'Message status updated successfully',
      contactMessage: updated,
    });
  } catch (error) {
    console.error('Update message status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
