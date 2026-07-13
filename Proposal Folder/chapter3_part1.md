# CHAPTER THREE
## METHODOLOGY AND SYSTEM DESIGN

This chapter delineates the systematic procedures, architectural frameworks, and research methodologies employed to achieve the objectives of this study. It outlines the research design, the target population, sampling techniques, data collection instruments, and the comprehensive system architecture detailing the development of the mobile learning application and the administrative backend.

### Research Design
The study adopts a Research and Development (R&D) design integrated with a pre-experimental pre-test/post-test framework. The R&D approach is utilized for the rigorous design, iterative development, and technical validation of the dual-tier educational software (the mobile application and the web-based administrative backend). This methodology involves a cyclic process of requirement analysis, architectural design, software coding, internal testing, and iterative refinement based on heuristic evaluations.

Following the successful development of the software prototype, a pre-experimental research design will be employed to evaluate the system's pedagogical efficacy, usability, and impact on user engagement. This quantitative approach allows for the empirical assessment of the intervention—specifically, the multisensory learning modules and the gamified reward system—by comparing the literacy performance and engagement metrics of the target demographic before and after utilizing the mobile application over a specified intervention period.

### Population, Sample, and Sampling Technique
The target population for this study comprises primary school children (ages 5–12) within the Ilorin Metropolis, Kwara State, Nigeria, who have been formally diagnosed with dyslexia or exhibit significant symptoms of specific reading difficulties. A secondary population includes special education teachers, therapists, and parents who are actively involved in the educational remediation of these children.

A purposive sampling technique will be employed to select a representative sample size of 50 primary users (children with dyslexia) and 20 secondary users (10 educators/therapists and 10 parents). Purposive sampling is deemed appropriate as the study necessitates participants who meet specific inclusion criteria: children must exhibit documented phonological deficits and have access to an Android mobile device, while educators must be currently practicing within inclusive or special education settings. This targeted approach ensures that the empirical data collected accurately reflects the experiences and needs of the demographic for whom the software was explicitly engineered.

### Research Instrument
Data collection will be facilitated through three primary instruments: an adapted Literacy Performance Test (LPT), a System Usability Scale (SUS) questionnaire, and backend application analytics.

1. **Literary Performance Test (LPT):** The LPT will serve as both the pre-test and post-test instrument. It comprises a standardized set of interactive tasks designed to measure foundational literacy metrics, specifically phoneme-grapheme recognition, reading fluency, and visual comprehension. The LPT will be administered digitally to accurately record response times and error rates.
2. **System Usability Scale (SUS) Questionnaire:** The SUS is a highly reliable, 10-item Likert-scale questionnaire utilized to assess the subjective usability and accessibility of the software. Two distinct versions of the SUS will be administered: one adapted for the secondary users to evaluate the administrative backend, and a simplified, pictorial version for the primary users to evaluate the mobile application interface.
3. **Backend Application Analytics:** Objective, quantitative data regarding user engagement will be automatically collected by the NestJS backend system. This includes metrics such as time-on-task, module completion rates, frequency of app usage, and the accumulation of gamified rewards (Points and Naira Icons).

### Validation and Reliability of the Research Instruments
To ensure the validity of the Research Instruments, the adapted Literacy Performance Test and the SUS questionnaires will be subjected to face and content validation by a panel of three experts: two specialists in Special Education and one expert in Educational Technology from the University of Ilorin. The experts will evaluate the instruments for pedagogical relevance, clarity of instruction, and cultural appropriateness. Based on their critical feedback, necessary modifications will be integrated prior to the pilot study.

The reliability of the LPT and SUS questionnaires will be determined through a pilot test conducted with a small, non-participating sample of 10 children and 5 educators. The internal consistency of the instruments will be calculated using Cronbach's Alpha reliability coefficient. A reliability index of 0.75 or higher will be considered acceptable for the study, ensuring that the instruments consistently measure the intended variables across different testing periods.

### Procedure for Data Collection
The data collection process will be executed in three systematic phases spanning a six-week period:
- **Phase I (Pre-Intervention):** Following the acquisition of informed consent from parents and institutional approval from participating schools, the pre-test (LPT) will be administered to the 50 primary users to establish a baseline literacy metric. Concurrently, secondary users will be provided with login credentials for the administrative backend and instructed on how to assign learning modules.
- **Phase II (Intervention):** Over a consecutive four-week period, the primary users will engage with the mobile learning application. They will be required to utilize the app for a minimum of 30 minutes daily, progressing through the six multisensory modules (Tap the Sound, Trace the Letter, etc.). During this phase, backend analytics will continuously record engagement data and reward accumulation. Secondary users will utilize the dashboard to monitor progress and dynamically adjust module difficulty.
- **Phase III (Post-Intervention):** At the conclusion of the four-week intervention, the post-test (LPT) will be administered to measure any significant changes in literacy metrics. Furthermore, both primary and secondary users will complete their respective System Usability Scale (SUS) questionnaires to provide subjective feedback on the technological platform.

### Data Analysis Techniques
The empirical data collected will be analyzed using both descriptive and inferential statistical methods via the Statistical Package for the Social Sciences (SPSS). 
- Descriptive statistics, including means, standard deviations, and frequency distributions, will be utilized to summarize the demographic data, backend analytics (time-on-task, completion rates), and the SUS usability scores.
- Inferential statistics, specifically the Paired Samples T-test, will be employed to test the null hypotheses ($H_{01}$ and $H_{02}$), comparing the mean differences between the pre-test and post-test literacy scores to determine the statistical significance of the intervention at the 0.05 alpha level. Independent Samples T-tests will be utilized to analyze variations in usability perceptions among different subsets of secondary users ($H_{03}$).
