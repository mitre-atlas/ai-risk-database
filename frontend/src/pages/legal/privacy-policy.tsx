import { PageContainer } from "@/components/PageContainer/PageContainer";
import { PageTop } from "@/components/PageTop/PageTop";
import { ShareMeta } from "@/components/ShareMeta/ShareMeta";
import { SectionTitle } from "@/components/Typography/Typography";
import Box from "@mui/material/Box";
import Link from "next/link";

const PrivacyPolicy = () => {
  return (
    <>
      <ShareMeta title="Privacy Policy | AI Risk Database" />
      <PageTop>
        <h1 className="h1 pt-16 pb-14 lg:px-0 px-6 lg:break-all">
          Privacy Policy
        </h1>
      </PageTop>
      <PageContainer>
        <Box className="box">
          <SectionTitle>Last Updated 4/19/2023</SectionTitle>

          <p className="about-text mb-4">
            Robust Intelligence, Inc. (“Robust Intelligence,” “we,” “us,” or
            “our”) values your privacy, and we provide this Privacy Policy to
            describe the information we collect, how we use it, and when and
            with whom we share it. This Privacy Policy applies to your access
            and use of our website, airisk.io, and all other online services on
            which we display a link to this Privacy Policy (collectively, “AI
            Risk Database”). This Privacy Policy does not apply to information
            we collect in our capacity as a vendor or service provider for our
            customers. It also does not apply to other online services we
            provide that do not display a link to this Privacy Policy. By
            accessing or using AI Risk Database, you agree to this Privacy
            Policy. If you do not agree to this Privacy Policy, please do not
            access or use AI Risk Database.
          </p>

          <p className="about-text mb-4">
            By accessing or using AI Risk Database, you acknowledge the
            applicability of this Privacy Policy. If you do not agree to this
            Privacy Policy, please do not access or use AI Risk Database.
          </p>

          <p className="about-text mb-6">
            Undefined capitalized terms used in this Privacy Policy shall have
            the definitions set forth in the AI Risk Database{" "}
            <Link
              href="/legal/terms-of-service"
              className="text-secondary-dark-blue hover:underline"
            >
              Terms of Service
            </Link>
            .
          </p>

          <SectionTitle className="ml-4">
            1. Information We Collect
          </SectionTitle>

          <p className="about-text mb-4">
            We collect information when you access or use AI Risk Database. The
            types of information we collect depend on how you use AI Risk
            Database.
          </p>

          <h4 className="text-base ml-8 mb-4">
            a. Information You Provide Directly to Us
          </h4>

          <p className="about-text mb-4">
            We collect information you submit directly to us such as when you
            register for an account, submit Vulnerability Reports, or otherwise
            contact us through AI Risk Database. The information we collect
            directly from you may include:
          </p>

          <ul className="list-disc ml-8 text-sm text-shuttle-gray mb-4">
            <li>Information we collect through github OAuth</li>
            <ul className="list-[circle] ml-8">
              <li>Github username</li>
              <li>Name</li>
              <li>Email address</li>
            </ul>
          </ul>

          <p className="about-text mb-4">
            You are not required to provide us with such information, but
            certain features of AI Risk Database may not be accessible or
            available, absent the provision of the requested information.
          </p>

          <h4 className="text-base ml-8 mb-4">
            b. Information We Collect Automatically
          </h4>

          <p className="about-text mb-4">
            We, or our third-party providers, may also collect device
            information, IP addresses, http referrer fields, and other
            information about your computer or device and your usage of AI Risk
            Database. We may also collect information that is sent to us
            automatically by your web browser. We automatically receive
            information about your interactions with AI Risk Database, such as
            the pages or other content you view and the dates and times of your
            visits. We may also collect general information about your location
            (e.g. inferred from an IP address).
          </p>

          <p className="about-text mb-4">
            You can choose to accept or decline cookies. Most web browsers
            automatically accept cookies, but your browser may allow you to
            modify your browser settings to decline cookies if you prefer. If
            you disable cookies, you may be prevented from taking full advantage
            of the AI Risk Database, because AI Risk Database may not function
            properly. As we adopt additional technologies, we may also gather
            additional information through other methods.
          </p>

          <h4 className="text-base ml-8 mb-4">
            c. Information from Affiliates and Non-Affiliated Parties
          </h4>

          <p className="about-text mb-4">
            We may collect information about you or others through our
            affiliates or through non-affiliated parties. For example, you may
            provide us with Vulnerability Reports by signing in with third-party
            credentials, such as Github credentials. If you access AI Risk
            Database through a Third-Party Account, that third party may provide
            us with access to certain information about you. This may include,
            without limitation, your Third-Party Account user ID, user name,
            avatar, name, company, email, and social media handles.
          </p>

          <p className="about-text mb-4">
            We may also collect information about Models from third-party
            sources, such as services that market or otherwise make available
            artificial intelligence models on an open-sourced basis. The
            information we collect related to the Models may contain
            identifiable information, such as the source of the Model.
          </p>

          <p className="about-text mb-6">
            We may combine information that we collect from you through AI Risk
            Database with information that we obtain from such other parties and
            information derived from other products or services we provide.
          </p>

          <SectionTitle className="ml-4">
            2. How We Use the Information We Collect
          </SectionTitle>

          <p className="about-text mb-4">
            We use the information we collect for business and commercial
            purposes, such as:
          </p>

          <ul className="list-disc ml-8 text-sm text-shuttle-gray mb-4">
            <li>To respond to your questions or inquiries;</li>
            <li>
              To communicate with you, including to communicate with you about
              our products and services;
            </li>
            <li>
              To analyze and improve AI Risk Database and other products or
              services we offer or provide;
            </li>
            <li>
              To update the information available within AI Risk Database,
              including Vulnerability Reports and Risk Overviews;
            </li>
            <li>
              To comply with our legal obligations or as permitted by law;
            </li>
            <li>
              To protect the safety and integrity of our employees, third
              parties, and/or our services;
            </li>
            <li>To improve our advertising and marketing;</li>
            <li>To prevent fraud and enforce our legal terms; and</li>
            <li>To administer and troubleshoot AI Risk or our services.</li>
          </ul>

          <p className="about-text mb-6">
            We may aggregate and/or de-identify information collected through AI
            Risk Database. We may use and disclose de-identified or aggregated
            data for any purpose, including without limitation for research and
            marketing purposes.
          </p>

          <SectionTitle className="ml-4">
            3. When We Disclose the Information We Collect
          </SectionTitle>

          <p className="about-text mb-4">
            We may disclose the information we collect in the following
            situations:
          </p>

          <p className="about-text mb-4">
            Affiliates: We may disclose the information we collect to our
            affiliates.
          </p>
          <p className="about-text mb-4">
            Consent/At Your Direction: We may disclose your information to
            nonaffiliated third parties based on your consent to do so. For
            example, if you submit a Vulnerability Report, we may attribute you
            to that Vulnerability Report and make that information available to
            users of AI Risk Database.
          </p>
          <p className="about-text mb-4">
            Publicly-Available Information Available Within AI Risk Database: We
            may also otherwise disclose information about you that is publicly
            available, such as identifiable information associated with Models.
          </p>
          <p className="about-text mb-4">
            Vendors: We may disclose your information to third-party vendors
            that provide services to us, such as third-party hosting providers.
          </p>
          <p className="about-text mb-4">
            Protection of Robust Intelligence and Others: We may share or
            disclose certain information if we believe in good faith that doing
            so is necessary or appropriate to protect or defend the rights,
            safety, or property of Robust Intelligence, our agents and
            affiliates, employees, users and/or the public, including to defend
            or enforce our Privacy Policy or any other contractual arrangement.
          </p>

          <p className="about-text mb-4">
            Legal Requirements: We may share or disclose certain information if
            we believe in good faith that doing so is necessary or appropriate
            to comply with any law enforcement, legal, or regulatory process,
            such as to respond to a warrant, subpoena, court order, or other
            applicable laws and regulations.
          </p>

          <p className="about-text mb-6">
            Business Transfer: We may share or disclose certain information in
            connection with or during negotiations of any merger, sale of
            company assets, financing, or acquisition of all or a portion of our
            business to another company.
          </p>

          <SectionTitle className="ml-4">4. Rights and Choices</SectionTitle>

          <p className="about-text mb-4">
            You have certain rights and choices with respect to your information
            such as:
          </p>

          <ul className="list-disc ml-8 text-sm text-shuttle-gray mb-6">
            <li>
              Account Information: You can revoke consent for third parties to
              share your information with us by following any instructions made
              available by those third parties.
            </li>
            <li>
              Marketing Emails: You can unsubscribe from marketing emails by
              following the directions in those emails. Please note that if you
              unsubscribe from marketing emails, we may still send you
              administrative emails regarding AI Risk Database or our services,
              including, for example, notices of updates to our{" "}
              <Link
                href="/legal/terms-of-service"
                className="text-secondary-dark-blue hover:underline"
              >
                Terms of Service
              </Link>{" "}
              or this Privacy Policy.
            </li>
          </ul>

          <SectionTitle className="ml-4">5. Security</SectionTitle>

          <p className="about-text mb-6">
            We maintain administrative, technical, and physical safeguards to
            protect information that you submit to us. However, no system is
            completely secure or error-free. We do not, and cannot, guarantee
            the complete security of your information.
          </p>

          <SectionTitle className="ml-4">6. Data Retention</SectionTitle>

          <p className="about-text mb-6">
            We keep your information for the time necessary for the purposes for
            which it is processed. The length of time for which we retain
            information depends on the purposes for which we collect and use it
            and your choices, after which time we may delete and/or aggregate
            it. We may also retain and use this information as necessary to
            comply with our legal obligations, resolve disputes, and enforce our
            agreements.
          </p>

          <SectionTitle className="ml-4">
            7. Children&apos;s Privacy
          </SectionTitle>

          <p className="about-text mb-6">
            AI Risk Database is intended for users over the age of 18. If we
            become aware that a child under 13 (or a higher age threshold where
            applicable) has provided us with personal data, we will take steps
            to comply with any applicable legal requirement to remove such
            information.
          </p>

          <SectionTitle className="ml-4">
            8. Residents of the European Economic Area and United Kingdom
          </SectionTitle>

          <p className="about-text mb-4">
            Robust Intelligence is considered the “data controller” of the
            personal data we handle under this Privacy Policy. In other words,
            Robust Intelligence is responsible for deciding how to collect, use
            and disclose this data, subject to applicable law. The laws of some
            jurisdictions such as the laws of the European Economic Area and the
            United Kingdom require data controllers to tell you about the legal
            ground that they rely on for using or disclosing of your
            information. To the extent those laws apply, our legal grounds are
            as follows:
          </p>

          <ul className="list-disc ml-8 text-sm text-shuttle-gray mb-4">
            <li>
              Contractual Necessity: We may use or disclose information to honor
              our contractual commitments to you. For example, we will process
              your personal data to comply with our agreements with you, and to
              honor our commitments in any contracts that we have with you.
            </li>
            <li>
              With Your Consent: Where required by law, and in some other cases,
              we use or disclose information on the basis of your consent. You
              may withdraw any consent you previously provided to us regarding
              the processing of your personal data, at any time and free of
              charge. We will apply your preferences going forward and this will
              not affect the lawfulness of the processing before you withdrew
              your consent.
            </li>
            <li>
              Legitimate Interests: In many cases, we use or disclose
              information on the ground that it furthers our legitimate business
              interests in ways that are not overridden by the interests or
              fundamental rights and freedoms of the affected individuals, such
              as customer service, certain promotional activities, analyzing and
              improving our business, providing security for AI Risk Database,
              preventing fraud, and managing legal issues.
            </li>
            <li>
              Legal Compliance: We need to use and disclose information in
              certain ways to comply with our legal obligations, such as to
              comply with tax and accounting obligations.
            </li>
          </ul>

          <p className="about-text mb-4">
            In addition to those rights described herein, you have the right to
            lodge a complaint with the relevant supervisory authority. However,
            we encourage you to contact us first, and we will do our very best
            to resolve your concern.
          </p>

          <p className="about-text mb-4">
            Your local law may provide you certain rights with respect to your
            personal data. Depending on your jurisdiction, you may request that
            we:
          </p>

          <ul className="list-disc ml-8 text-sm text-shuttle-gray mb-4">
            <li>
              provide access to and/or a copy of certain information we hold
              about you;
            </li>
            <li>
              prevent the processing of your information for direct-marketing
              purposes (including any direct marketing processing based on
              profiling);
            </li>
            <li>update information which is out of date or incorrect;</li>
            <li>delete certain information that we are holding about you;</li>
            <li>
              restrict the way that we process and disclose certain of your
              information;
            </li>
            <li>
              transfer your information to a third-party provider of services;
              and
            </li>
            <li>revoke your consent for the processing of your information.</li>
          </ul>

          <p className="about-text mb-6">
            Please note, however, that certain information may be exempt from
            such requests in some circumstances, which may include needing to
            continue processing your information for our legitimate interests or
            to comply with a legal obligation. We may request you provide us
            with information necessary to confirm your identity before
            responding to your request. To exercise any of these rights, please
            contact us as described in the “Contact Us” section below.
          </p>

          <SectionTitle className="ml-4">9. Consent to Transfer</SectionTitle>

          <p className="about-text mb-6">
            We may store and process data in the United States and other
            countries outside the United States which may have data protection
            laws that differ from the laws in your country. By using AI Risk
            Database, you consent to the collection, processing, maintenance,
            and transfer of such information in and to the United States and
            other applicable countries in which the privacy laws may not be as
            comprehensive as, or equivalent to, those in the country where you
            reside and/or are a citizen.
          </p>

          <SectionTitle className="ml-4">
            10. Links to Third-Party Sites and Services
          </SectionTitle>

          <p className="about-text mb-6">
            Please note that AI Risk Database may contain links to third-party
            websites. Since we do not control third-party sites and are not
            responsible for any information you may provide while on such sites,
            we encourage you to read the privacy policies on those websites
            before providing any of your information on such sites.
          </p>

          <SectionTitle className="ml-4">
            11. California Do-Not-Track Notice
          </SectionTitle>

          <p className="about-text mb-6">
            AI Risk Database does not recognize or respond to browser-initiated
            Do-Not-Track signals.
          </p>

          <SectionTitle className="ml-4">
            12. Changes to Our Privacy Policy
          </SectionTitle>

          <p className="about-text mb-6">
            We reserve the right to change this Privacy Policy at any time.
            Please check this page periodically for updates. If we make any
            material changes to this Privacy Policy, we will post the changes
            here and notify you either via email or by notice on this Site.
          </p>

          <SectionTitle className="ml-4">13. Contact Us</SectionTitle>
          <p className="about-text mb-6">
            If you have any questions about this Privacy Policy, please contact
            us at support@robustintelligence.com.
          </p>
        </Box>
      </PageContainer>
    </>
  );
};

export default PrivacyPolicy;
