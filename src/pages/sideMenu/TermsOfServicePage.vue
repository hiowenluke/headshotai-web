<template>
  <ContentPageBase :is-open="isOpen" page-title="Terms of Service" @close="$emit('close')">
    <section>
      <h3>1. Acceptance of Terms</h3>
      <p>By accessing and using this AI headshot generation service, you accept and agree to be bound by the terms and provision of this agreement.</p>
    </section>

    <section>
      <h3>2. Service Description</h3>
      <p>Our service provides AI-powered headshot generation using uploaded photos. We use artificial intelligence to create professional-looking portraits based on your images.</p>
    </section>

    <section>
      <h3>3. User Responsibilities</h3>
      <p>You are responsible for:</p>
      <ul>
        <li>Providing accurate and lawful content</li>
        <li>Ensuring you have rights to uploaded images</li>
        <li>Using the service in compliance with applicable laws</li>
        <li>Maintaining the confidentiality of your account</li>
      </ul>
    </section>

    <section>
      <h3>4. Privacy and Data</h3>
      <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.</p>
    </section>

    <section>
      <h3>5. Intellectual Property</h3>
      <p>The generated headshots and service technology remain our intellectual property. You receive a license to use generated images for personal and commercial purposes.</p>
    </section>

    <section>
      <h3>6. Limitation of Liability</h3>
      <p>We provide the service "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
    </section>

    <section>
      <h3>7. Modifications</h3>
      <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.</p>
    </section>

    <section>
      <h3>8. Contact Information</h3>
      <p>If you have questions about these Terms of Service, please contact us through our support channels.</p>
    </section>
  </ContentPageBase>
</template>

<script setup lang="ts">
import ContentPageBase from '../../components/pageLike/ContentPageBase.vue';

defineProps<{ isOpen: boolean }>();
defineEmits<{ (e: 'close'): void }>();
</script>
