import { NextResponse } from "next/server";

/**
 * POST /api/welcome-email
 *
 * Sends a welcome email to a newly registered user via the Resend API.
 * Called internally after a successful Supabase signup.
 */
export async function POST(request: Request) {
  try {
    const { email, name, baseUrl: bodyBaseUrl } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const host = request.headers.get("host") || "";
    const proto = request.headers.get("x-forwarded-proto") || "http";
    const headerBaseUrl = host ? `${proto}://${host}` : "";
    const baseUrl = bodyBaseUrl || headerBaseUrl;

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not set");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const displayName = name || email.split("@")[0];

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Bookmarks <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to Bookmarks 🔖",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
            <body style="margin:0;padding:0;background-color:#0f0f14;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f14;padding:40px 20px;">
                <tr>
                  <td align="center">
                    <table width="560" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:16px;overflow:hidden;border:1px solid rgba(139,92,246,0.2);">
                      <!-- Header -->
                      <tr>
                        <td style="padding:40px 40px 24px;text-align:center;">
                          <div style="font-size:36px;margin-bottom:8px;">🔖</div>
                          <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                            Welcome to Bookmarks
                          </h1>
                        </td>
                      </tr>
                      <!-- Body -->
                      <tr>
                        <td style="padding:0 40px 32px;">
                          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#a0a0b8;">
                            Hey <strong style="color:#c4b5fd;">${displayName}</strong>,
                          </p>
                          <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#a0a0b8;">
                            Thanks for signing up! Your account is ready. Start saving and organizing
                            your favorite links in one beautiful place.
                          </p>
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center">
                                 <a href="${baseUrl ? `${baseUrl}/dashboard` : "#"}"
                                   style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;letter-spacing:0.3px;">
                                  Go to Dashboard →
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Footer -->
                      <tr>
                        <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
                          <p style="margin:0;font-size:13px;color:#64648b;">
                            You're receiving this because you signed up for Bookmarks.<br/>
                            If you didn't create this account, you can safely ignore this email.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Resend API error:", errorData);
      return NextResponse.json(
        { error: "Failed to send welcome email" },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error("Welcome email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
