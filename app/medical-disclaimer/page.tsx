import { LegalDoc, PublicPage } from "@/components/shell/PublicPage";

export default function Page() {
  return (
    <PublicPage title="Medical disclaimer" subtitle="Important information about how to use SuppAI safely.">
      <LegalDoc
        updated="1 July 2026"
        sections={[
          { h: "Not medical advice", p: "The content, plans, and analysis provided by SuppAI are for general wellness and informational purposes only. They are not a diagnosis, treatment, or a substitute for advice from a qualified healthcare professional." },
          { h: "No doctor-patient relationship", p: "Using the app does not create a doctor-patient relationship, except where you explicitly book a consultation with a licensed practitioner through the platform." },
          { h: "Use your judgement", p: "Always consult a qualified professional before starting a new diet, supplement, or exercise routine, especially if you are pregnant, nursing, taking medication, or managing a medical condition." },
          { h: "In an emergency", p: "SuppAI is not for emergencies. If you think you may have a medical emergency, call your local emergency number or go to the nearest hospital immediately." },
          { h: "Third-party practitioners", p: "Doctors and labs available through SuppAI are independent providers responsible for their own advice and services. SuppAI facilitates access but does not practise medicine." },
        ]}
      />
    </PublicPage>
  );
}
