import { PageContainer } from "@/components/PageContainer/PageContainer";
import { PageTop } from "@/components/PageTop/PageTop";
import { ShareMeta } from "@/components/ShareMeta/ShareMeta";
import Box from "@mui/material/Box";
import { SectionTitle } from "@/components/Typography/Typography";
import Link from "next/link";

const PrivacyPolicyLink = () => (
  <Link
    href="/legal/privacy-policy"
    className="text-secondary-dark-blue hover:underline"
  >
    Privacy Policy
  </Link>
);

const TermsOfService = () => {
  return (
    <>
      <ShareMeta title="Terms and Conditions | AI Risk Database" />
      <PageTop>
        <h1 className="h1 pt-16 pb-14 lg:px-0 px-6 lg:break-all">
          Terms of Service
        </h1>
      </PageTop>
      <PageContainer>
        <Box className="box">
          <SectionTitle>Last Updated 4/19/2023</SectionTitle>
          <p className="about-text mb-6">
            <strong>
              IMPORTANT NOTICE: THIS AGREEMENT CONTAINS A BINDING ARBITRATION
              PROVISION AND CLASS ACTION WAIVER. IT AFFECTS YOUR LEGAL RIGHTS AS
              DETAILED IN THE{" "}
              <Link
                href="/legal/terms-of-service/#arbitration"
                className="text-secondary-dark-blue hover:underline"
              >
                ARBITRATION AND CLASS ACTION WAIVER SECTION BELOW.
              </Link>{" "}
              PLEASE READ CAREFULLY.
            </strong>
          </p>

          <SectionTitle>1. Acceptance of Terms of Service</SectionTitle>

          <p className="about-text mb-6">
            These AI Risk Database Terms of Service (“Terms”) are a binding
            legal agreement between you and Robust Intelligence, Inc. (“Robust
            Intelligence,” “we,”, “our,” or “us”). These Terms govern your
            access to and use of our AI Risk Database website at{" "}
            <a
              className="text-secondary-dark-blue hover:underline"
              href="https://airisk.io"
            >
              airisk.io
            </a>{" "}
            (the “Site”), including any information made available on the
            website (collectively with the Site, the “Services”).
          </p>
          <p className="about-text mb-4">
            By using or otherwise accessing the Services or clicking to accept
            or agree to these Terms, you (1) accept and agree these Terms and
            (2) acknowledge that the collection, use, disclosure and other
            handling of information from the Services shall be as described in
            our <PrivacyPolicyLink />, and (3) agree to comply with all rules,
            policies, and disclaimers posted on the Services or about which you
            are notified.
          </p>
          <p className="about-text mb-4">
            All references to “you” or “your,” as applicable, mean the person
            who accesses, uses, and/or participates in the Services in any
            manner, and each of your heirs, assigns, and successors. If you use
            the Services on behalf of an entity or another individual, you
            represent and warrant that you have the authority to bind that
            entity or individual, your acceptance of the Terms will be deemed an
            acceptance by that entity or individual, and “you” and ”your” herein
            shall refer to that entity, its directors, officers, employees, and
            agents.
          </p>

          <p className="about-text mb-6">
            <strong>
              PLEASE READ THE TERMS THOROUGHLY AND CAREFULLY. BY ACCESSING OR
              USING THE SERVICES, YOU AGREE TO BE BOUND BY THESE TERMS. IF YOU
              DO NOT AGREE TO THESE TERMS, THEN YOU MAY NOT ACCESS OR USE THE
              SERVICES.
            </strong>
          </p>

          <SectionTitle>2. The AI Risk Database</SectionTitle>
          <p className="about-text mb-6">
            AI Risk Database is a tool for discovering and reporting the risks
            associated with public machine learning models. The database is
            specifically designed for organizations that rely on artificial
            intelligence, i.e. “AI,” for their operations, providing them with
            an overview of the risks and vulnerabilities associated with
            publicly available models.
          </p>
          <p className="about-text mb-4">
            Public machine learning models listed on the Services (each, a
            “Model”) are given a “Risk Overview” that is based on various
            factors such as (1) Model performance, generalization ability, and
            robustness to minor transformations; (2) security and privacy and
            its underlying dataset; (3) fairness of treatment among protected
            classes and subcategories in the data; and (4) user-submitted AI
            vulnerability reports (each a “Vulnerability Report”).
          </p>
          <p className="about-text mb-4">
            ANY MODELS IDENTIFIED ON THE SERVICES AND ANY RISK OVERVIEWS ARE FOR
            GENERAL INFORMATIONAL PURPOSES ONLY AND PROVIDED ON AN AS-IS BASIS
            WITHOUT WARRANTIES OF ANY KIND. We do not endorse any Models or the
            content, products, or services available from third parties whose
            products may be referenced on the Services.
          </p>

          <SectionTitle>
            3. Modification of the Terms or the Services
          </SectionTitle>
          <p className="about-text mb-6">
            Except for Section 14 providing for binding arbitration and waiver
            of class action rights, Robust Intelligence reserves the right, at
            its reasonable and sole discretion, to modify or replace these Terms
            at any time. You are responsible for reviewing and becoming familiar
            with any such modifications. If we determine a revision to the
            Terms, in our sole discretion, is material, we will notify you as
            required by law. Use of the Services by you after any modification
            to the Terms constitutes your acceptance of the Terms as modified.
            If you do not accept the changes, you must discontinue using the
            Services.
          </p>
          <p className="about-text mb-4">
            Robust Intelligence reserves the right at any time to modify,
            suspend, discontinue, or terminate, temporarily or permanently, the
            Services (or any part thereof), with or without notice. You agree
            that Robust Intelligence shall not be liable to you for any
            modification, suspension, or discontinuance of the Services.
          </p>

          <SectionTitle>4. Eligibility and Account Creation</SectionTitle>
          <p className="about-text mb-6">
            Only individuals who are at least 18 years old and can form legally
            binding contracts under applicable law of their jurisdiction are
            permitted to access the Services. By accessing or using the
            Services, you represent and warrant that you are 18 or older and can
            form a binding contract with Robust Intelligence.
          </p>
          <p className="about-text mb-4">
            You may be required or have the opportunity to create an account
            (“Account”) to use parts of the Services, such as submitting a
            Vulnerability Report. You may be able to create an Account by
            linking a third-party account, such as a Github account (each a,
            “Third-Party Account”), to the Services. By creating an Account, you
            represent and warrant that any information to create your Account is
            accurate, current, and complete information, and you further agree
            to update information to keep it accurate, current, and complete. If
            you create an Account by linking a Third-Party Account, you further
            represent and warrant that you have rights to the information in the
            Third-Party Account, and you are authorized to provide such
            information from the Third-Party Account to Robust Intelligence. You
            further understand any information provided to us by the Third-Party
            Account shall be processed by Robust Intelligence in accordance with
            our <PrivacyPolicyLink />.
          </p>
          <p className="about-text mb-4">
            You are solely responsible for safeguarding your Account
            credentials. You are solely responsible for all activity that occurs
            on your Account, and we may assume that any communications,
            including Submissions (as defined below) we receive under your
            Account have been made by you. You must notify Robust Intelligence
            immediately of any breach of security or unauthorized use of your
            Account. Robust Intelligence will not be liable and you may be
            liable for losses, damages, liability, expenses, and lawyers’ fees
            incurred by Robust Intelligence or a third party arising from
            someone else using your Account due to your conduct regardless of
            whether you have notified us of such unauthorized use. You
            understand and agree that we may require you to provide information
            that may be used to confirm your identity and help ensure the
            security of your Account.
          </p>
          <p className="about-text mb-4">
            If Robust Intelligence has previously prohibited you from accessing
            or using the Services, you are not permitted to access or use the
            Services.
          </p>

          <SectionTitle>
            5. Vulnerability Reports and Other User Submissions
          </SectionTitle>
          <p className="about-text mb-6">
            Submissions in accordance with our <PrivacyPolicyLink />. You
            further understand that Robust Intelligence has no obligation to
            consider, make available to users, or otherwise integrate your
            Vulnerability Reports or other Submissions into the Services,
            including any Risk Overviews for any Models. By providing a
            Vulnerability Report or any other Submission, you understand Robust
            Intelligence may at its discretion review and integrate that
            Vulnerability Report into the Services, including in Risk Overviews.
          </p>
          <p className="about-text mb-4">
            <strong>
              YOU FURTHER AGREE THAT YOU WILL ONLY PROVIDE VULNERABILITY REPORTS
              OR OTHER SUBMISSIONS THAT YOU WISH TO PUBLICLY SHARE AND THAT IN
              ANY CASE, YOU WILL NOT KNOWINGLY SUBMIT ANY SUBMISSIONS TO THE
              SERVICES THAT CONTAINS CONFIDENTIAL OR COMMERCIALLY SENSITIVE DATA
              OR PERSONAL DATA OF ANY INDIVIDUAL WITHOUT LAWFUL PERMISSION.
            </strong>
          </p>
          <p className="about-text mb-4">
            You grant to Robust Intelligence a non-exclusive, irrevocable,
            perpetual, worldwide, royalty-free, sublicensable (through multiple
            tiers) right to exercise the copyright, publicity, and database
            rights, including the right to use, reproduce, display, edit, copy,
            modify, transmit, publicly perform, or create derivative works
            thereof, that you have in your Submissions, in any media now known
            or not currently known, with respect to any such Submissions. This
            license shall survive termination of the Services, these Terms, or
            your Account. Robust Intelligence does not claim ownership rights in
            your Submissions and nothing in these Terms will be deemed to
            restrict rights that you may have to use and exploit your
            Submissions.
          </p>
          <p className="about-text mb-4">
            To the extent Submissions are available on the Services, your access
            to such information and content will be solely at your own risk.
            Robust Intelligence is not liable for any errors or omissions in
            that information or content or for any damages or loss you might
            suffer in connection with it. You acknowledge and agree that Robust
            Intelligence may or may not, in its sole discretion, pre-screen
            Vulnerability Reports before they are posted or integrated into the
            Services, but has no obligation to do so. Robust Intelligence
            reserves the right (but does not assume the obligation) in its sole
            discretion to reject, move, edit, or remove any Submissions,
            including but not limited to any Submission that violates these
            Terms or is otherwise objectionable. By using the Services, you
            understand that you may be exposed to Submissions that you may
            consider offensive or objectionable. We cannot control and have no
            duty to take any action regarding how you may interpret and use
            Submissions or what actions you may take as a result of Submissions,
            and you hereby release us from all liability to you for any and all
            Submissions.
          </p>
          <p className="about-text mb-4">
            Robust Intelligence has no responsibility or liability for the
            deletion of, or the failure to store or transmit, any Submissions.
          </p>

          <SectionTitle>6. Rules & Prohibitions</SectionTitle>
          <p className="about-text mb-6">
            You agree you will not use the Services for any purpose that is
            unlawful or prohibited by these Terms, or any other purpose not
            reasonably intended by Robust Intelligence. Without limitation, you
            agree not to:
          </p>

          <ul className="list-disc ml-8 text-sm text-shuttle-gray mb-4 flex flex-col gap-4">
            <li>
              Create multiple Accounts or misrepresent your identity, or forge
              or manipulate headers or identifiers to disguise the origin of any
              content transmitted through the Services;
            </li>
            <li>
              Engage in any conduct that is fraudulent, inaccurate, infringing,
              libelous, defamatory, abusive, offensive, obscene, pornographic or
              otherwise violates any law or right of Robust Intelligence, its
              users, or any third party, including privacy rights, copyrights,
              or other intellectual property right;
            </li>
            <li>
              Violate any federal, state, or local law, statute, ordinance,
              regulation, or ethical code;
            </li>
            <li>
              Engage in any behavior that is defamatory, trade libelous,
              unlawfully threatening or unlawfully harassing including, without
              limitation, submitting false Vulnerability Reports or other
              Submissions;
            </li>
            <li>
              Submit any content, including through Vulnerability Reports,
              containing any viruses, Trojan horses, or other computer
              programming routines that may damage, detrimentally interfere
              with, surreptitiously intercept or expropriate any system, data or
              personal information;
            </li>
            <li>
              Scrape, access, monitor, index, frame, link, or copy any content
              on the Services by accessing the Services in an automated way,
              using any robot, spider, scraper, web crawler, or using any method
              of access other than manually accessing the publicly-available
              portions of the Services through a browser or accessing the
              Services through any approved mobile application, application
              programming interface, or client application;
            </li>
            <li>
              Decompile, reverse engineer, or otherwise attempt to obtain the
              source code or underlying ideas or information of or relating to
              the Services;
            </li>
            <li>
              Probe, scan, or test the vulnerability of any system or network or
              breach or circumvent any security or authentication measures we
              may use to prevent or restrict access to the Services or use of
              the Services or the content therein;
            </li>
            <li>
              Attack, or attempt to attack the Services via a denial-of-service
              attack or a distributed denial-of service attack;
            </li>
            <li>
              Violate the restrictions in any robot exclusion headers of the
              Services, if any, or bypass or circumvent other measures employed
              to prevent or limit access to the Services;
            </li>
            <li>
              Engage in any activity that could cause us to violate any
              applicable law, statute, ordinance, or regulation;
            </li>
            <li>
              Resell or make any commercial use of our system or the content on
              the Services without our prior written consent;
            </li>
            <li>
              Use the Services in a way that violates or facilitates violations
              of these Terms, any other agreement or guidelines that govern use
              of the Services or attempt to do any of the foregoing directly or
              indirectly;
            </li>
            <li>Transfer any rights granted to you under these Terms;</li>
            <li>
              Obtain or use any content from the Services except as specifically
              permitted by the Services, use or attempt to use the Services to
              mine information in any way that could identify individual persons
              in their private capacity, attempt to access or misappropriate
              content contained in the Services, or otherwise use the Services
              for any purpose other than to review Models;
            </li>
            <li>
              Access the Services or content to build a similar or competitive
              website, product, or service; or
            </li>
            <li>Attempt to indirectly undertake any of the foregoing.</li>
          </ul>

          <p className="about-text mb-6">
            Robust Intelligence has the right to investigate and prosecute
            violations of any of the above to the fullest extent of the law.
            Robust Intelligence may involve and cooperate with law enforcement
            authorities in prosecuting users who violate these Terms.
          </p>

          <SectionTitle>7. Proprietary Rights</SectionTitle>
          <p className="about-text mb-6">
            All right, title, and interest in and to the Services are and will
            remain the exclusive property of Robust Intelligence and its
            licensors. All materials therein, including, without limitation,
            software, images, text, graphics, illustrations, logos, patents,
            trademarks, service marks, copyrights, photographs, audio, videos,
            music, and all intellectual property rights related thereto, are the
            exclusive property of Robust Intelligence and its licensors. The
            Services are protected by copyright, trademark, and other laws of
            both the United States and foreign countries. You acknowledge that
            the Services have been developed, compiled, prepared, revised,
            selected, and arranged by Robust Intelligence and others through the
            application of methods and standards of judgment developed and
            applied through the expenditure of substantial time, effort, and
            money and constitute valuable intellectual property of Robust
            Intelligence and such others.
          </p>
          <p className="about-text mb-4">
            Subject to your complete and ongoing compliance with these Terms,
            Robust Intelligence grants you a non-transferable, non-exclusive,
            revocable, limited license to access and use the Services. We
            reserve all rights not expressly granted to you by these Terms.
          </p>

          <SectionTitle>8. Feedback</SectionTitle>
          <p className="about-text mb-6">
            By sending us any feedback, comments, questions, or suggestions
            concerning Robust Intelligence, the Services, or us (collectively,
            “Feedback”) you represent and warrant (a) that you have the right to
            disclose the Feedback, (b) that the Feedback does not violate the
            rights of any other person or entity, and (c) that your Feedback
            does not contain the confidential or proprietary information of any
            third party or parties. By sending us any Feedback, you further (i)
            agree that we are under no obligation of confidentiality, express or
            implied, with respect to the Feedback, (ii) acknowledge that we may
            have something similar to the Feedback already under consideration
            or in development, (iii) grant us an irrevocable, non-exclusive,
            royalty-free, perpetual, worldwide license to use, modify, prepare
            derivative works, publish, distribute, and sublicense the Feedback,
            and (iv) irrevocably waive, and cause to be waived, against Robust
            Intelligence and its users any claims and assertions of any moral
            rights contained in such Feedback. This Feedback section shall
            survive any termination of your Account, these Terms, the Services,
            or your participation in the Services.
          </p>

          <SectionTitle>
            9. Links to Third-Party Sites and Services
          </SectionTitle>
          <p className="about-text mb-6">
            The Services may provide, or third parties may provide, links to
            other sites, applications, or resources. Because Robust Intelligence
            has no control over such sites, applications, and resources, you
            acknowledge and agree that Robust Intelligence is not responsible
            for the availability of such external sites, applications, or
            resources, and does not endorse and is not responsible or liable for
            any content, advertising, products or other materials on or
            available from such sites or resources. You further acknowledge and
            agree that Robust Intelligence shall not be responsible or liable,
            directly or indirectly, for any damage or loss caused or alleged to
            be caused by or in connection with use of or reliance on any such
            content, goods, or services available on or through any such site or
            resource.
          </p>
          <p className="about-text mb-4">
            <strong>
              T IS THE RESPONSIBILITY OF THE USER TO EVALUATE THE ACCURACY,
              COMPLETENESS, AND USEFULNESS OF ANY MODEL, VULNERABILITY REPORT,
              RISK OVERVIEW, OR OTHER CONTENT AVAILABLE THROUGH THE SERVICES,
              FROM THIRD PARTIES OR OBTAINED FROM A LINKED SITE OR SERVICE.{" "}
            </strong>
          </p>

          <SectionTitle>10. Duration and Termination of Terms</SectionTitle>
          <p className="about-text mb-6">
            Duration. The agreement between you and Robust Intelligence
            reflected by these Terms is effective when you access the Services
            (for example to create an Account) and remains in effect until
            either you or we terminate the agreement in accordance with these
            Terms. Termination by Users. Users may terminate their Account by
            written notice via e-mail to support@robustintelligence.com.
            Terminations typically will be effective within seven (7) business
            days after our receipt of your termination notice, at which time
            your Account will be closed and you will no longer enjoy access to
            your former Account.
          </p>
          <p className="about-text mb-4">
            Termination by Robust Intelligence. At any time, with or without
            notice, for any or no reason, Robust Intelligence reserves the right
            to modify or discontinue any portion or all of the Services, and to
            restrict, suspend, and terminate any user’s Account.{" "}
          </p>
          <p className="about-text mb-4">
            Survival. Sections 1, 3, and 5-16 of these Terms, and any other
            provisions that are necessary to effectuate those sections, shall
            survive termination.
          </p>

          <SectionTitle>11. Indemnity and Release</SectionTitle>
          <p className="about-text mb-6">
            You agree to release and to indemnify, defend, and hold harmless
            Robust Intelligence and its parents, subsidiaries, affiliates, and
            agents, as well as the officers, directors, employees, shareholders,
            and representatives of any of the foregoing entities, from and
            against any and all losses, liabilities, expenses, damages, costs
            (including attorneys’ fees and court costs), claims, actions,
            inquiries, or investigations of any kind whatsoever arising out of
            or resulting from your violation of these Terms, and any of your
            acts or omissions that implicate publicity rights, defamation, or
            invasion of privacy. Robust Intelligence reserves the right, at its
            own expense, to assume exclusive defense and control of any matter
            otherwise subject to indemnification by you and, in such case, you
            agree to cooperate with Robust Intelligence in the defense of such
            matter.
          </p>
          <p className="about-text mb-4">
            In the event that you have a dispute with one or more other users,
            you release Robust Intelligence, its officers, employees, agents,
            and successors from claims, demands, and damages of every kind or
            nature, known or unknown, suspected or unsuspected, disclosed or
            undisclosed, arising out of or in any way related to such disputes
            and/or the Services. If you are a California resident, you waive
            California Civil Code Section 1542, which provides:
          </p>
          <ul className="list-disc ml-8 text-sm text-shuttle-gray mb-4 flex flex-col gap-4">
            <li>
              A general release does not extend to claims that the creditor or
              releasing party does not know or suspect to exist in his or her
              favor at the time of executing the release and that, if known by
              him or her, would have materially affected his or her settlement
              with the debtor or released party.
            </li>
          </ul>
          <p className="about-text mb-4">
            If you are not a California resident, you waive your rights under
            any statute or common law principle similar to Section 1542 that
            governs your rights in the jurisdiction of your residence.
          </p>

          <SectionTitle>12. Disclaimers</SectionTitle>
          <p className="about-text mb-6">
            Neither Robust Intelligence nor its licensors or suppliers make any
            representations or warranties concerning any content contained in or
            accessed through the Services, and we will not be responsible or
            liable for the accuracy, functionality, copyright compliance,
            legality, suitability, or decency of material contained in or
            accessed through the Services. We (and our licensors and suppliers)
            make no representations or warranties regarding suggestions or
            recommendations of Models or other content.
          </p>
          <p className="about-text mb-4">
            <strong>
              THE SERVICES AND ALL CONTENT CONTAINED WITHIN THE SERVICES,
              INCLUDING MODELS AND RISK OVERVIEWS, ARE PROVIDED TO YOU ON AN “AS
              IS” BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
              IMPLIED, INCLUDING, WITHOUT LIMITATION, IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
              NON-INFRINGEMENT, OR THAT USE OF THE SERVICES WILL BE
              UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE OR THAT THE SERVICES
              OR CONTENT THAT MAY BE OBTAINED FROM THE SERVICES WILL BE ACCURATE
              OR RELIABLE OR THAT THE QUALITY OF ANY INFORMATION OBTAINED BY YOU
              THROUGH THE SERVICES WILL MEET YOUR EXPECTATIONS. WE DO NOT
              WARRANT OR GUARANTEE THAT THE SERVICES WILL BE AVAILABLE AT ANY
              PARTICULAR TIME OR LOCATION, UNINTERRUPTED, ERROR-FREE, WITHOUT
              DEFECT OR SECURE; THAT ANY DEFECTS OR ERRORS WILL BE CORRECTED; OR
              THAT THE SERVICES ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
              UNDER NO CIRCUMSTANCES WILL ROBUST INTELLIGENCE BE LIABLE FOR ANY
              LOSS OR DAMAGE CAUSED BY A USER’S ACCESS, USE, OR RELIANCE ON
              INFORMATION OBTAINED THROUGH THE SERVICES.
            </strong>
          </p>
          <p className="about-text mb-4">
            We will not be liable for any loss or damage caused by a distributed
            denial-of-service attack, viruses or other technologically harmful
            material that may infect your computer equipment, computer programs,
            data or other proprietary material due to your access to or use of
            the Services or any third-party content or websites accessed
            through, or in any way in conjunction with, the Services.
          </p>
          <p className="about-text mb-4">
            <strong>
              SOME STATES DO NOT ALLOW LIMITATIONS ON HOW LONG AN IMPLIED
              WARRANTY LASTS, SO THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.
            </strong>
          </p>

          <SectionTitle>13. Limitation of Liability</SectionTitle>
          <p className="about-text mb-6">
            <strong>
              TO THE FULLEST EXTENT ALLOWED BY APPLICABLE LAW, UNDER NO
              CIRCUMSTANCES AND UNDER NO LEGAL THEORY (INCLUDING, WITHOUT
              LIMITATION, TORT, CONTRACT, STRICT LIABILITY, OR OTHERWISE) SHALL
              ROBUST INTELLIGENCE, ITS PARENTS, SUBSIDIARIES, OFFICERS,
              DIRECTORS, SHAREHOLDERS, EMPLOYEES, AGENTS, JOINT VENTURERS,
              CONSULTANTS, SUCCESSORS, OR ASSIGNS BE LIABLE TO YOU OR TO ANY
              OTHER PERSON FOR ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL,
              EXEMPLARY, PUNITIVE, OR CONSEQUENTIAL DAMAGES OF ANY KIND,
              INCLUDING DAMAGES FOR LOST PROFITS, LOSS OF GOODWILL, WORK
              STOPPAGE, ACCURACY OF RESULTS, OR COMPUTER FAILURE OR MALFUNCTION,
              EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. THE LIMITATION
              OF DAMAGES SET FORTH ABOVE IS A FUNDAMENTAL ELEMENT OF THE BASIS
              OF THE BARGAIN BETWEEN US AND YOU. THIS LIMITATION OF LIABILITY
              APPLIES TO ANY ALLEGED OR ACTUAL LOSSES RESULTING FROM: (a) YOUR
              ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES;
              (b) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY, INCLUDING WITHOUT
              LIMITATION, ANY DEFAMATORY, OFFENSIVE OR ILLEGAL CONDUCT OF OTHER
              USERS OR ROBUST INTELLIGENCE IN VULNERABILITY REPORTS OR RISK
              OVERVIEWS; (c) ANY CONTENT, INCLUDING MODELS OR RISK OVERVIEWS,
              OBTAINED FROM THE SERVICES; AND (d) UNAUTHORIZED ACCESS, USE OR
              ALTERATION OF YOUR MODELS OR SUBMISSIONS.
            </strong>
          </p>
          <p className="about-text mb-4">
            <strong>
              THE SERVICES, INCLUDING THE CONTENT AVAILABLE WITHIN THE SERVICES,
              WOULD NOT BE PROVIDED WITHOUT SUCH LIMITATIONS. THE LIMITATIONS ON
              DAMAGES SET FORTH ABOVE ARE FUNDAMENTAL ELEMENTS OF THE BASIS OF
              THE BARGAIN AND ARE MATERIAL TO ROBUST INTELLIGENCE’S DECISION TO
              ENTER INTO THE AGREEMENT BETWEEN ROBUST INTELLIGENCE AND YOU. SOME
              STATES DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN
              DAMAGES, SO THE ABOVE LIMITATION AND EXCLUSIONS MAY NOT APPLY TO
              YOU.
            </strong>
          </p>
          <p className="about-text mb-4">
            <strong>
              THE LIMITATION OF LIABILITY DESCRIBED ABOVE SHALL APPLY FULLY TO
              RESIDENTS OF NEW JERSEY.
            </strong>
          </p>

          <SectionTitle id="arbitration">
            14. Arbitration and Class Action Waiver
          </SectionTitle>

          <p className="about-text mb-6">
            <strong>
              PLEASE READ THIS “DISPUTE RESOLUTION” SECTION CAREFULLY, AS IT MAY
              SIGNIFICANTLY AFFECT YOUR LEGAL RIGHTS, INCLUDING YOUR RIGHT TO
              FILE OR PARTICIPATE IN A LAWSUIT FILED IN COURT.
            </strong>
          </p>

          <h4 className="text-base ml-8 mb-4">
            a. Information Dispute Resolution Procedure
          </h4>
          <p className="about-text mb-4">
            If a dispute arises between you and Robust Intelligence, we are
            committed to working with you to reach a reasonable resolution. For
            any such dispute, both parties acknowledge and agree that they will
            first make a good faith effort to resolve it informally before
            initiating any formal dispute resolution proceeding in arbitration
            or otherwise. This requires first sending a written description of
            the dispute to the other party. For any dispute you initiate, you
            agree to send the written description of the dispute along with the
            email address associated with your account, if any, to the following
            email address: support@robustintelligence.com. For any dispute that
            Robust Intelligence initiates, we will send our written description
            of the dispute to the email address associated with your Account.
            The written description must be on an individual basis and provide,
            at minimum, the following information: your name; a description of
            the nature or basis of the claim or dispute; and the specific relief
            sought. If the dispute is not resolved within sixty (60) days after
            receipt of the written description of the dispute, you and Robust
            Intelligence agree to the further dispute resolution provisions
            below.
          </p>
          <p className="about-text mb-4">
            The above process for an informal dispute resolution process is
            required before you may commence any formal dispute resolution
            proceeding. The parties agree that any relevant limitations period
            and filing fees or other deadlines will be tolled while the parties
            engage in this informal dispute resolution process.
          </p>

          <h4 className="text-base ml-8 mb-4">
            b. Mutual Arbitration Agreement
          </h4>
          <p className="about-text mb-4">
            You and Robust Intelligence agree that all claims, disputes, or
            disagreements that may arise out of your access or use of the
            Services including without limitation (i) the content available
            within the Services such as Risk Overviews, Vulnerability Reports,
            and Models; (ii) these Terms (including its formation, performance,
            and breach); or (iii) that in any way relate to the provision or use
            of the Services, your relationship with Robust Intelligence, or any
            other dispute with Robust Intelligence, shall be resolved
            exclusively through binding arbitration in accordance with this
            Section 14 (collectively, the “Arbitration Agreement”). This
            includes claims that arose, were asserted, or involve facts
            occurring before the existence of this Arbitration Agreement or any
            prior agreement as well as claims that may arise after the
            termination of this Arbitration Agreement, in accordance with the
            notice and opt-out provisions set forth in Section 14(i). This
            Arbitration Agreement is governed by the Federal Arbitration Act
            (“FAA”) in all respects and evidences a transaction involving
            interstate commerce. You and Robust Intelligence expressly agree
            that the FAA shall exclusively govern the interpretation and
            enforcement of this Arbitration Agreement. If for whatever reason
            the rules and procedures of the FAA cannot apply, the state law
            governing arbitration agreements in the state in which you reside
            shall apply.
          </p>
          <p className="about-text mb-4">
            Except as set forth in this Section 14, the arbitrator or
            arbitration body, and not any federal, state or local court or
            agency, shall have exclusive authority to resolve all disputes
            arising out of or relating to the interpretation, applicability,
            enforceability or formation of these Terms and this Arbitration
            Agreement, including, but not limited to any claim that all or any
            part thereof are void or voidable, whether a claim is subject to
            arbitration, and any dispute regarding the payment of administrative
            or arbitrator fees (including the timing of such payments and
            remedies for nonpayment). The arbitrator or arbitration body shall
            be empowered to grant whatever relief would be available in a court
            under law or in equity.
          </p>
          <p className="about-text mb-4">
            Notwithstanding the parties&apos; decision to resolve all disputes
            through arbitration, each party retains the right to (i) elect to
            have any claims resolved in small claims court on an individual
            basis for disputes and actions within the scope of such court’s
            jurisdiction, regardless of what forum the filing party initial
            chose; (ii) bring an action in state or federal court to protect its
            intellectual property rights (“intellectual property rights“ in this
            context means patents, copyrights, moral rights, trademarks, and
            trade secrets and other confidential or proprietary information, but
            not privacy or publicity rights); and (iii) seek a declaratory
            judgment, injunction, or other equitable relief in a court of
            competent jurisdiction regarding whether a party&apos;s claims are
            time-barred or may be brought in small claims court. Seeking such
            relief shall not waive a party&apos;s right to arbitration under
            this agreement, and any filed arbitrations related to any action
            filed pursuant to this paragraph shall automatically be stayed
            pending the outcome of such action.
          </p>
          <p className="about-text mb-4">
            You and Robust Intelligence agree to submit to the personal
            jurisdiction of any federal or state court in California in order to
            compel arbitration, to stay proceedings pending arbitration, or to
            confirm, modify, vacate, or enter judgment on the award entered by
            the arbitrator; and in connection with any such proceeding, further
            agree to accept service of process by U.S. mail and hereby waive any
            and all jurisdictional and venue defenses otherwise available.
          </p>
          <p className="about-text mb-4">
            Except as set forth in Section 14(c) below, if any provision of this
            Arbitration Agreement is found by an arbitrator or court of
            competent jurisdiction to be invalid, the parties nevertheless agree
            that the arbitrator or court should endeavor to give effect to the
            parties&apos; intentions as reflected in the provision, and the
            other provisions thereof remain in full force and effect.
          </p>
          <p className="about-text mb-4">
            <strong>
              THE PARTIES UNDERSTAND THAT ARBITRATION MEANS THAT AN ARBITRATOR
              AND NOT A JUDGE OR JURY WILL DECIDE THE CLAIM, AND THAT RIGHTS TO
              PREHEARING EXCHANGE OF INFORMATION AND APPEALS MAY BE LIMITED IN
              ARBITRATION. YOU HEREBY ACKNOWLEDGE AND AGREE THAT YOU AND ROBUST
              INTELLIGENCE ARE EACH WAIVING THE RIGHT TO A TRIAL BY JURY TO THE
              MAXIMUM EXTENT PERMITTED BY LAW.
            </strong>
          </p>

          <h4 className="text-base ml-8 mb-4">
            c. Class Arbitration and Collective Relief Waiver
          </h4>
          <p className="about-text mb-4">
            <strong>
              YOU AND ROBUST INTELLIGENCE ACKNOWLEDGE AND AGREE THAT, TO THE
              MAXIMUM EXTENT ALLOWED BY LAW, EXCEPT AS SET OUT OTHERWISE IN THIS
              SECTION 14(c), ANY ARBITRATION SHALL BE CONDUCTED IN AN INDIVIDUAL
              CAPACITY ONLY AND NOT AS A CLASS OR OTHER CONSOLIDATED ACTION AND
              THE ARBITRATOR MAY AWARD RELIEF ONLY IN FAVOR OF THE INDIVIDUAL
              PARTY SEEKING RELIEF AND ONLY TO THE EXTENT NECESSARY TO RESOLVE
              AN INDIVIDUAL PARTY’S CLAIM, UNLESS ROBUST INTELLIGENCE PROVIDES
              ITS CONSENT TO CONSOLIDATE IN WRITING.
            </strong>
          </p>
          <p className="about-text mb-4">
            If there is a final judicial determination that this Section 14(c)
            is not enforceable as to a particular claim or request for relief,
            then the parties agree that that particular claim or request for
            relief may proceed in court but shall be severed and stayed pending
            arbitration of the remaining claims. This provision does not prevent
            you or Robust Intelligence from participating in a class-wide
            settlement of claims.
          </p>

          <h4 className="text-base ml-8 mb-4">d. Arbitration Rules</h4>
          <p className="about-text mb-4">
            The arbitration will be administered by National Arbitration and
            Mediation (“NAM”) and resolved before a single arbitrator. If NAM is
            not available to arbitrate, the parties will select an alternative
            arbitration provider, but in no event shall any arbitration be
            administered by the American Arbitration Association.
          </p>
          <p className="about-text mb-4">
            Except as modified by this “Arbitration Agreement“ provision, NAM
            will administer the arbitration in accordance with the NAM
            Comprehensive Dispute Resolution Rules and Procedures, Fees For
            Disputes When One of the Parties is a Consumer and the Mass Filing
            Dispute Resolution Rules and Procedures in effect at the time any
            demand for arbitration is filed with NAM, excluding any rules or
            procedures governing or permitting class or representative actions.
            The applicable NAM rules and procedures are available at
            www.namadr.com or by emailing National Arbitration and Mediation’s
            Commercial Dept at commercial@namadr.com.
          </p>

          <h4 className="text-base ml-8 mb-4">e. Initiating Arbitration</h4>
          <p className="about-text mb-4">
            Only after the parties have engaged in a good-faith effort to
            resolve the dispute in accordance with the Informal Dispute
            Resolution Procedure provision, and only if those efforts fail, then
            either party may initiate binding arbitration as the sole means to
            resolve claims using the procedures set forth in the applicable NAM
            rules. If you are initiating arbitration, a copy of the demand shall
            also be emailed to support@robustintelligence.com. If Robust
            Intelligence is initiating arbitration, it will serve a copy of the
            demand to the email address associated with your Account or the
            email that Robust Intelligence has on file for you. The arbitrator
            has the right to impose sanctions in accordance with the NAM rules
            and procedures for any frivolous claims or submissions the
            arbitrator determines have not been filed in good faith, as well as
            for a party&apos;s failure to comply with the Informal Dispute
            Resolution Procedure contemplated by this Arbitration Agreement.
          </p>

          <h4 className="text-base ml-8 mb-4">
            f. Arbitration Location and Procedure
          </h4>
          <p className="about-text mb-4">
            If you are a resident of the United States the arbitration will be
            conducted in the county where you reside, and if you are not a
            resident of the United States the arbitration shall be conducted in
            California, United States of America, unless you and Robust
            Intelligence otherwise agree or unless the designated arbitrator
            determines that such venue would be unreasonably burdensome to any
            party, in which case the arbitrator shall have the discretion to
            select another venue. If the amount in controversy does not exceed
            $10,000 and you do not seek injunctive or declaratory relief, then
            the arbitration will be conducted solely on the basis of documents
            you and Robust Intelligence submit to the arbitrator, unless the
            arbitrator determines that a hearing is necessary. If the amount in
            controversy exceeds $10,000 or seeks declaratory or injunctive
            relief, either party may request (or the arbitrator may determine)
            to hold a hearing, which shall be via videoconference or telephone
            conference unless the parties agree otherwise.
          </p>
          <p className="about-text mb-4">
            Subject to the applicable NAM rules and procedures, the parties
            agree that the arbitrator will have the discretion to allow the
            filing of dispositive motions if they are likely to efficiently
            resolve or narrow issues in dispute. Unless otherwise prohibited by
            law, all arbitration proceedings will be confidential and closed to
            the public and any parties other than you and Robust Intelligence
            (and each of the parties’ authorized representatives and agents),
            and all records relating thereto will be permanently sealed, except
            as necessary to obtain court confirmation of the arbitration award
            (provided that the party seeking confirmation shall seek to file
            such records under seal to the extent permitted by law).
          </p>

          <h4 className="text-base ml-8 mb-4">g. Arbitrator’s Decision</h4>
          <p className="about-text mb-4">
            The arbitrator will render an award within the time frame specified
            in the applicable NAM rules and procedures. The arbitrator&apos;s
            decision will include the essential findings and conclusions upon
            which the arbitrator based the award. Judgment on the arbitration
            award may be entered in any court having jurisdiction thereof. The
            arbitrator will have the authority to award monetary damages on an
            individual basis and to grant, on an individual basis, any
            non-monetary remedy or relief available to an individual to the
            extent available under applicable law, the arbitral forum&apos;s
            rules, and this Arbitration Agreement. The parties agree that the
            damages and/or other relief must be consistent with the terms of the
            “Limitation of Liability“ section of these Terms as to the types and
            the amounts of damages or other relief for which a party may be held
            liable. No arbitration award or decision will have any preclusive
            effect as to issues or claims in any dispute with anyone who is not
            a named party to the arbitration. Attorneys&apos; fees will be
            available to the prevailing party in the arbitration only if
            authorized under applicable substantive law governing the claims in
            the arbitration.
          </p>

          <h4 className="text-base ml-8 mb-4">h. Fees</h4>
          <p className="about-text mb-4">
            You are responsible for your own attorneys&apos; fees unless the
            arbitration rules and/or applicable law provide otherwise. The
            parties agree that NAM has discretion to reduce the amount or modify
            the timing of any administrative or arbitration fees due under NAM’s
            Rules where it deems appropriate, provided that such modification
            does not increase the costs to you, and you further agree that you
            waive any objection to such fee modification. The parties also agree
            that a good-faith challenge by either party to the fees imposed by
            NAM does not constitute a default, waiver, or breach of this
            Arbitration Agreement while such challenge remains pending before
            NAM, the arbitrator, and/or a court of competent jurisdiction, and
            that any and all due dates for those fees shall be tolled during the
            pendency of such challenge.
          </p>

          <h4 className="text-base ml-8 mb-4">
            i. Right to Opt Out of the Arbitration Agreement
          </h4>
          <p className="about-text mb-4">
            IF YOU DO NOT WISH TO BE BOUND BY THE “ARBITRATION AGREEMENT” AS SET
            FORTH IN THIS SECTION 14, THEN: (1) you must notify Robust
            Intelligence in writing within thirty (30) days of the date that you
            first accessed or otherwise become subject to this Arbitration
            Agreement (or any subsequent changes to the provisions of the
            section titled “Arbitration and Class Action Waiver”); (2) your
            written notification must be mailed to 555 19th Street, San
            Francisco, CA 94107 or emailed to support@robustintelligence.com;
            and (3) your written notification must include (a) your name, (b)
            your address, and (c) a clear statement that you wish to opt out of
            this Arbitration Agreement. If you do not timely opt out of this
            Arbitration Agreement, such action shall constitute mutual
            acceptance of the terms of these “Arbitration and Class Action
            Waiver” provisions by you and Robust Intelligence.
          </p>

          <h4 className="text-base ml-8 mb-4">
            j. Changes to this Arbitration Agreement
          </h4>
          <p className="about-text mb-4">
            Robust Intelligence will provide thirty (30) days&apos; notice of
            any changes affecting the substance of this Arbitration and Class
            Action Waiver section, including by posting the change on the
            Services, or providing any other notice in accordance with legal
            requirements. Any such changes will go into effect 30 days after
            Robust Intelligence provides this notice and apply to all claims not
            yet filed. If you reject any such changes by opting out of the
            Arbitration Agreement, you may exercise your right to a trial by
            jury or judge, as permitted by applicable law, but any prior
            existing agreement to arbitrate disputes under a prior version of
            the Arbitration Agreement will not apply to claims not yet filed. If
            Robust Intelligence changes this “Arbitration and Class Action
            Waiver“ section after the date you first accepted this Agreement (or
            accepted any subsequent changes to this Agreement), you agree that
            your continued use of the Services 30 days after such change will be
            deemed acceptance of those changes. If you do not agree to such
            change, you may opt out by providing notice as described in Section
            14(i).
          </p>

          <h4 className="text-base ml-8 mb-4">15. Venue and Governing Law</h4>
          <p className="about-text mb-4">
            For any dispute not subject to arbitration or under the jurisdiction
            of a small claims court, you and Robust Intelligence agree to submit
            to the personal and exclusive jurisdiction of any venue in the
            federal and state courts located in California. You further agree to
            accept service of process by mail, and hereby waive any and all
            jurisdictional and venue defenses otherwise available.
          </p>
          <p className="about-text mb-4">
            The Terms and the relationship between you and Robust Intelligence
            shall be governed by the laws of the State California without regard
            to conflict of law provisions.
          </p>

          <SectionTitle>15. Venue and Governing Law</SectionTitle>
          <p className="about-text mb-6">
            For any dispute not subject to arbitration or under the jurisdiction
            of a small claims court, you and Robust Intelligence agree to submit
            to the personal and exclusive jurisdiction of any venue in the
            federal and state courts located in California. You further agree to
            accept service of process by mail, and hereby waive any and all
            jurisdictional and venue defenses otherwise available.
          </p>
          <p className="about-text mb-4">
            The Terms and the relationship between you and Robust Intelligence
            shall be governed by the laws of the State California without regard
            to conflict of law provisions.
          </p>

          <SectionTitle>16. General</SectionTitle>
          <p className="about-text mb-6">
            Entire Agreement. These Terms (and any additional terms, contracts,
            rules, and conditions that Robust Intelligence may post on the
            Services) constitute the entire agreement between you and Robust
            Intelligence with respect to the Services and supersede any prior
            agreements, oral or written, between you and Robust Intelligence.{" "}
          </p>
          <p className="about-text mb-4">
            Waiver and Severability. If any provision(s) of the Terms is held by
            an arbitrator or court of competent jurisdiction to be contrary to
            law, then such provision(s) shall be construed, as nearly as
            possible, to reflect the intentions of the parties and the other
            provisions shall remain in full force and effect. Robust
            Intelligence’s failure to exercise or enforce any of the Terms shall
            not constitute a waiver of Robust Intelligence’s right to exercise
            or enforce the Terms as to the same or another instance.
          </p>
          <p className="about-text mb-4">
            Assignment. You agree that Robust Intelligence may assign the Terms
            to any other entity of its choosing, with or without notice to you.
            You may not assign the Terms to any other party for any reason.
          </p>
          <p className="about-text mb-4">
            Section Titles. The section titles in the Terms are solely used for
            the convenience of the parties and have no legal or contractual
            significance.
          </p>
          <p className="about-text mb-4">
            Statute of Limitations. You agree that regardless of any statute or
            law to the contrary, any claim or cause of action arising out of or
            related to the use of the Services or the Terms must be filed within
            one (1) year after such claim or cause of action arose or be forever
            barred. This statute of limitations provision does not apply to
            residents of New Jersey.
          </p>
          <p className="about-text mb-4">
            Notice. Robust Intelligence may give notice by any means of
            communication reasonably anticipated to notify you of the
            information provided. You agree that all notices, disclosures, and
            other communications that we provide to you electronically satisfy
            any legal requirement that such communications be in writing or be
            delivered in a particular manner. You agree that you have the
            ability to store such electronic communications such that they
            remain accessible to you in an unchanged form. By way of example
            only, such communication may be a general notice on the Services or
            via email to the email address listed on your Account. It is your
            obligation to update your Account information so that we may contact
            you as may be necessary. Such notice shall be deemed to have been
            given 48 hours after dispatch. If physical notice (e.g., US Mail) is
            used, then such notice shall be deemed to have been given 7 days
            after dispatch.
          </p>
          <p className="about-text mb-4">
            No Third-Party Beneficiaries. You agree that, except as otherwise
            expressly provided in these Terms, there shall be no third-party
            beneficiaries to these Terms.
          </p>

          <SectionTitle>17. Contact Us</SectionTitle>
          <p className="about-text mb-8">
            If you have questions about these Terms, please contact us at
            support@robustintelligence.com.
          </p>
        </Box>
      </PageContainer>
    </>
  );
};

export default TermsOfService;
