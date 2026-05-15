/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { to, subject, body } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ success: false, error: 'Missing to, subject, or body' }, { status: 400 });
    }

    const pass = process.env.GMAIL_APP_PASSWORD;
    const user = 'moazzinzaman.mz@gmail.com';

    if (!pass || pass === 'PLACEHOLDER') {
      return NextResponse.json({ success: false, error: 'Gmail app password not configured.' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user,
        pass: pass,
      },
    });

    await transporter.sendMail({
      from: `"Moazzin Zaman" <${user}>`,
      to,
      subject,
      text: body,
      replyTo: 'moazzin.zaman@outlook.com', // So replies still go to your main inbox
    });

    return NextResponse.json({ success: true, message: `Email sent via Gmail from ${user}` });
  } catch (error: any) {
    console.error('Gmail Send Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
