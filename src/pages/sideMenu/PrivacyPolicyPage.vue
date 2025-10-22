<template>
  <ContentPageBase :is-open="isOpen" page-title="Privacy Policy" @close="$emit('close')">
    <section>
      <h3>1. Information We Collect</h3>
      <p>We collect information you provide directly to us, such as:</p>
      <ul>
        <li>Account information (email, name, profile data)</li>
        <li>Photos and images you upload for processing</li>
        <li>Payment information for subscription services</li>
        <li>Communications and support requests</li>
      </ul>
    </section>

    <section>
      <h3>2. How We Use Your Information</h3>
      <p>We use your information to:</p>
      <ul>
        <li>Provide and improve our AI headshot generation service</li>
        <li>Process your images and generate headshots</li>
        <li>Communicate with you about your account and our services</li>
        <li>Process payments and manage subscriptions</li>
        <li>Ensure security and prevent fraud</li>
      </ul>
    </section>

    <section>
      <h3>3. Information Sharing</h3>
      <p>We do not sell, trade, or otherwise transfer your personal information to third parties, except:</p>
      <ul>
        <li>With your explicit consent</li>
        <li>To trusted service providers who assist in our operations</li>
        <li>When required by law or to protect our rights</li>
        <li>In connection with a business transfer or merger</li>
      </ul>
    </section>

    <section>
      <h3>4. Data Security</h3>
      <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits.</p>
    </section>

    <section>
      <h3>5. Data Retention</h3>
      <p>We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. You may request deletion of your account and associated data at any time.</p>
    </section>

    <section>
      <h3>6. Your Rights</h3>
      <p>You have the right to:</p>
      <ul>
        <li>Access and review your personal information</li>
        <li>Correct inaccurate or incomplete data</li>
        <li>Request deletion of your personal information</li>
        <li>Opt-out of certain communications</li>
        <li>Export your data in a portable format</li>
      </ul>
    </section>

    <section>
      <h3>7. Cookies and Tracking</h3>
      <p>We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences.</p>
    </section>

    <section>
      <h3>8. Children's Privacy</h3>
      <p>Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.</p>
    </section>

    <section>
      <h3>9. Changes to This Policy</h3>
      <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the effective date.</p>
    </section>

    <section>
      <h3>10. Contact Us</h3>
      <p>If you have any questions about this Privacy Policy or our data practices, please contact us through our support channels.</p>
    </section>
  </ContentPageBase>
</template>

<script setup lang="ts">
import ContentPageBase from '../../components/pageLike/ContentPageBase.vue';

defineProps<{ isOpen: boolean }>();
defineEmits<{ (e: 'close'): void }>();
</script>
