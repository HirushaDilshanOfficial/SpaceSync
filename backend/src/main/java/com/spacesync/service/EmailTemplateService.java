package com.spacesync.service;

import org.springframework.stereotype.Service;

@Service
public class EmailTemplateService {

    public String buildApprovalEmail(String userName, String resourceName, String startTime, String endTime) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                "  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f8fa; margin: 0; padding: 0; }" +
                "  .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }" +
                "  .header { background-color: #3fb950; padding: 30px 20px; text-align: center; color: white; }" +
                "  .header h1 { margin: 0; font-size: 24px; font-weight: 600; }" +
                "  .content { padding: 40px 30px; color: #24292f; line-height: 1.6; }" +
                "  .content p { margin: 0 0 15px 0; font-size: 16px; }" +
                "  .details-box { background-color: #f6f8fa; border: 1px solid #d0d7de; border-radius: 8px; padding: 20px; margin: 25px 0; }" +
                "  .details-row { display: flex; margin-bottom: 10px; }" +
                "  .details-row:last-child { margin-bottom: 0; }" +
                "  .details-label { font-weight: 600; width: 120px; color: #57606a; font-size: 14px; }" +
                "  .details-value { flex: 1; font-size: 15px; color: #24292f; font-weight: 500; }" +
                "  .footer { padding: 20px; text-align: center; color: #57606a; font-size: 13px; border-top: 1px solid #eaeef2; }" +
                "  .btn { display: inline-block; background-color: #3fb950; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 20px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='header'>" +
                "      <h1>Booking Approved</h1>" +
                "    </div>" +
                "    <div class='content'>" +
                "      <p>Hello " + userName + ",</p>" +
                "      <p>Great news! Your workspace booking has been successfully <strong>approved</strong> by the administrator.</p>" +
                "      <div class='details-box'>" +
                "        <div class='details-row'><div class='details-label'>Resource:</div><div class='details-value'>" + resourceName + "</div></div>" +
                "        <div class='details-row'><div class='details-label'>From:</div><div class='details-value'>" + startTime + "</div></div>" +
                "        <div class='details-row'><div class='details-label'>To:</div><div class='details-value'>" + endTime + "</div></div>" +
                "      </div>" +
                "      <p>Please make sure to check in using the SpaceSync dashboard or QR scanner when you arrive.</p>" +
                "      <a href='http://localhost:5173/bookings' class='btn'>View My Bookings</a>" +
                "    </div>" +
                "    <div class='footer'>" +
                "      &copy; 2026 SpaceSync Inc. All rights reserved." +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }

    public String buildRejectionEmail(String userName, String resourceName, String startTime, String endTime, String reason) {
        String reasonHtml = reason != null && !reason.trim().isEmpty() 
            ? "<div class='reason-box'><strong>Reason:</strong> " + reason + "</div>" 
            : "";

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                "  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f8fa; margin: 0; padding: 0; }" +
                "  .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }" +
                "  .header { background-color: #f85149; padding: 30px 20px; text-align: center; color: white; }" +
                "  .header h1 { margin: 0; font-size: 24px; font-weight: 600; }" +
                "  .content { padding: 40px 30px; color: #24292f; line-height: 1.6; }" +
                "  .content p { margin: 0 0 15px 0; font-size: 16px; }" +
                "  .details-box { background-color: #f6f8fa; border: 1px solid #d0d7de; border-radius: 8px; padding: 20px; margin: 25px 0; }" +
                "  .details-row { display: flex; margin-bottom: 10px; }" +
                "  .details-row:last-child { margin-bottom: 0; }" +
                "  .details-label { font-weight: 600; width: 120px; color: #57606a; font-size: 14px; }" +
                "  .details-value { flex: 1; font-size: 15px; color: #24292f; font-weight: 500; }" +
                "  .reason-box { background-color: rgba(248,81,73,0.1); border-left: 4px solid #f85149; padding: 15px; margin: 20px 0; font-size: 15px; color: #b31d28; }" +
                "  .footer { padding: 20px; text-align: center; color: #57606a; font-size: 13px; border-top: 1px solid #eaeef2; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='header'>" +
                "      <h1>Booking Rejected</h1>" +
                "    </div>" +
                "    <div class='content'>" +
                "      <p>Hello " + userName + ",</p>" +
                "      <p>We regret to inform you that your workspace booking has been <strong>rejected</strong> by the administrator.</p>" +
                "      <div class='details-box'>" +
                "        <div class='details-row'><div class='details-label'>Resource:</div><div class='details-value'>" + resourceName + "</div></div>" +
                "        <div class='details-row'><div class='details-label'>From:</div><div class='details-value'>" + startTime + "</div></div>" +
                "        <div class='details-row'><div class='details-label'>To:</div><div class='details-value'>" + endTime + "</div></div>" +
                "      </div>" +
                reasonHtml +
                "      <p>If you have any questions, please contact the support team or try booking a different time slot.</p>" +
                "    </div>" +
                "    <div class='footer'>" +
                "      &copy; 2026 SpaceSync Inc. All rights reserved." +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }

    public String buildReminderEmail(String userName, String resourceName, String startTime) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                "  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f8fa; margin: 0; padding: 0; }" +
                "  .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }" +
                "  .header { background-color: #0969da; padding: 30px 20px; text-align: center; color: white; }" +
                "  .header h1 { margin: 0; font-size: 24px; font-weight: 600; }" +
                "  .content { padding: 40px 30px; color: #24292f; line-height: 1.6; }" +
                "  .content p { margin: 0 0 15px 0; font-size: 16px; }" +
                "  .highlight-box { background-color: rgba(9,105,218,0.1); border: 1px solid #0969da; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center; }" +
                "  .highlight-box h2 { margin: 0 0 10px 0; color: #0969da; font-size: 20px; }" +
                "  .highlight-box .time { font-size: 28px; font-weight: 700; color: #24292f; }" +
                "  .footer { padding: 20px; text-align: center; color: #57606a; font-size: 13px; border-top: 1px solid #eaeef2; }" +
                "  .btn { display: inline-block; background-color: #0969da; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 10px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='header'>" +
                "      <h1>Upcoming Booking Reminder</h1>" +
                "    </div>" +
                "    <div class='content'>" +
                "      <p>Hello " + userName + ",</p>" +
                "      <p>This is a quick reminder that your booking for <strong>" + resourceName + "</strong> is starting soon!</p>" +
                "      <div class='highlight-box'>" +
                "        <h2>Starts At</h2>" +
                "        <div class='time'>" + startTime + "</div>" +
                "      </div>" +
                "      <p>Please remember to check in when you arrive to confirm your attendance.</p>" +
                "      <div style='text-align: center;'>" +
                "        <a href='http://localhost:5173/bookings' class='btn'>Check In Now</a>" +
                "      </div>" +
                "    </div>" +
                "    <div class='footer'>" +
                "      &copy; 2026 SpaceSync Inc. All rights reserved." +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }

    public String buildCancellationEmail(String userName, String resourceName, String startTime, String endTime, String reason) {
        String reasonHtml = reason != null && !reason.trim().isEmpty() 
            ? "<div class='reason-box'><strong>Cancellation Reason:</strong> " + reason + "</div>" 
            : "";

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                "  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f8fa; margin: 0; padding: 0; }" +
                "  .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }" +
                "  .header { background-color: #f85149; padding: 30px 20px; text-align: center; color: white; }" +
                "  .header h1 { margin: 0; font-size: 24px; font-weight: 600; }" +
                "  .content { padding: 40px 30px; color: #24292f; line-height: 1.6; }" +
                "  .content p { margin: 0 0 15px 0; font-size: 16px; }" +
                "  .details-box { background-color: #f6f8fa; border: 1px solid #d0d7de; border-radius: 8px; padding: 20px; margin: 25px 0; }" +
                "  .details-row { display: flex; margin-bottom: 10px; }" +
                "  .details-row:last-child { margin-bottom: 0; }" +
                "  .details-label { font-weight: 600; width: 120px; color: #57606a; font-size: 14px; }" +
                "  .details-value { flex: 1; font-size: 15px; color: #24292f; font-weight: 500; }" +
                "  .reason-box { background-color: rgba(248,81,73,0.1); border-left: 4px solid #f85149; padding: 15px; margin: 20px 0; font-size: 15px; color: #b31d28; }" +
                "  .footer { padding: 20px; text-align: center; color: #57606a; font-size: 13px; border-top: 1px solid #eaeef2; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='header'>" +
                "      <h1>Booking Cancelled</h1>" +
                "    </div>" +
                "    <div class='content'>" +
                "      <p>Hello " + userName + ",</p>" +
                "      <p>Please note that your previously approved workspace booking has been <strong>cancelled</strong> by the administrator.</p>" +
                "      <div class='details-box'>" +
                "        <div class='details-row'><div class='details-label'>Resource:</div><div class='details-value'>" + resourceName + "</div></div>" +
                "        <div class='details-row'><div class='details-label'>From:</div><div class='details-value'>" + startTime + "</div></div>" +
                "        <div class='details-row'><div class='details-label'>To:</div><div class='details-value'>" + endTime + "</div></div>" +
                "      </div>" +
                reasonHtml +
                "      <p>If you have any questions, please contact the support team or book a different time slot.</p>" +
                "    </div>" +
                "    <div class='footer'>" +
                "      &copy; 2026 SpaceSync Inc. All rights reserved." +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }
}
