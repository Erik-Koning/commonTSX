export const generateGPTPrompt = (prompt: string, maxTokens: number) => {
  let examplePrompt = `Provide me a 2-3 sentence human written profession dental text string that would go in a field titled "comments" that is part of a report titled "report to referring clinician"
                  In this report i already have the following fields i only need the text for a new comments field:
                  <reportfields>
                  {"preamble":"Thank you for the referral of Mark Twain. It was a pleasure to meet with him and I appreciate the opportunity to be involved in him treatment. Please see below for summary of our appointment. More information can be found on additional pages/attachments as applicable.","comments":"","upcomingDentalAppointmentsInOurClinic":"Mark has an appointment scheduled in our office on 7/17/2024","nextRecommendedAppointmentAtReferringClinic":"The next appointment in your office should be .","thankYou":"Once again, thank you for your continued confidence. If any part of this report is unclear or you have any questions, please do not hesitate to contact me."}
                  Here is all the background data:
                  <entryFields>`;

  return {
    prompt,
    max_tokens: maxTokens,
    temperature: 0.5,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop: ["###"],
  };
};
