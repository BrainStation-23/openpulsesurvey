
import { Resend } from "npm:resend@2.0.0";
import { marked } from "npm:marked@9.1.6";
import { SupervisorAnalysis, SupervisorProfile, Campaign, EmailConfig } from "./types.ts";

export class EmailService {
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async sendAnalysisEmail(
    supervisor: SupervisorProfile,
    analysis: SupervisorAnalysis,
    campaign: Campaign,
    emailConfig: EmailConfig
  ) {
    const supervisorName = `${supervisor.first_name || ''} ${supervisor.last_name || ''}`.trim() || 'Supervisor';
    
    // Convert markdown analysis content to HTML
    const analysisHtml = await marked(analysis.analysis_content);
    
    const emailHtml = this.generateEmailHtml(supervisorName, analysis, campaign, analysisHtml);

    return this.resend.emails.send({
      from: `${emailConfig.from_name} <${emailConfig.from_email}>`,
      to: [supervisor.email],
      subject: `Team Analysis Report - ${campaign.name}`,
      html: emailHtml,
    });
  }

  private generateEmailHtml(
    supervisorName: string,
    analysis: SupervisorAnalysis,
    campaign: Campaign,
    analysisHtml: string
  ): string {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .content { padding: 20px; }
            .analysis { background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .stats { background-color: #e3f2fd; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px; }
            /* Markdown styling */
            .analysis h1, .analysis h2, .analysis h3 { color: #333; margin-top: 1.5em; margin-bottom: 0.5em; }
            .analysis h1 { font-size: 1.8em; }
            .analysis h2 { font-size: 1.5em; }
            .analysis h3 { font-size: 1.2em; }
            .analysis ul, .analysis ol { margin: 1em 0; padding-left: 2em; }
            .analysis li { margin: 0.5em 0; }
            .analysis p { margin: 1em 0; }
            .analysis strong { font-weight: bold; }
            .analysis em { font-style: italic; }
            .analysis blockquote { border-left: 4px solid #ddd; padding-left: 1em; margin: 1em 0; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Team Analysis Report</h1>
            <h2>Campaign: ${campaign.name}</h2>
          </div>
          
          <div class="content">
            <p>Dear ${supervisorName},</p>
            
            <p>We have completed the analysis of your team's survey responses. Below is your personalized team analysis report:</p>
            
            <div class="stats">
              <h3>Team Overview</h3>
              <ul>
                <li><strong>Team Size:</strong> ${analysis.team_size} members</li>
                <li><strong>Response Rate:</strong> ${Math.round(analysis.response_rate)}%</li>
                <li><strong>Analysis Generated:</strong> ${new Date(analysis.generated_at).toLocaleDateString()}</li>
              </ul>
            </div>
            
            <div class="analysis">
              <h3>Analysis Report</h3>
              <div>${analysisHtml}</div>
            </div>
            
            <p>This analysis is based on your team's survey responses and is designed to help you understand patterns, strengths, and areas for improvement within your team.</p>
            
            <p>If you have any questions about this analysis or would like to discuss the findings, please don't hesitate to reach out to the HR team.</p>
            
            <p>Best regards,<br>The Survey Analysis Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </body>
      </html>
    `;
  }
}
