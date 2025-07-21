import React, { useState } from 'react';
import { Island } from './Island';
import Input from './Input';
import Textarea from './Textarea';
import Select from './Select';
import Checkbox from './Checkbox';
import { Radio, RadioGroup } from './Radio';
import FormGroup from './FormGroup';
import Button from './Button';

const InputDemo: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    country: '',
    notifications: false,
    theme: 'light',
    newsletter: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const countryOptions = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'jp', label: 'Japan' },
  ];

  const themeOptions = [
    { value: 'light', label: 'Light Theme', description: 'Clean and bright interface' },
    { value: 'dark', label: 'Dark Theme', description: 'Easy on the eyes' },
    { value: 'auto', label: 'Auto', description: 'Follows system preference' },
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    if (!formData.country) {
      newErrors.country = 'Please select a country';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      alert('Form submitted successfully!');
      console.log('Form data:', formData);
    }
  };

  const SearchIcon = () => (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const EmailIcon = () => (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
    </svg>
  );

  const LocationIcon = () => (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <Island size="lg">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
          Islands UI Input Components Demo
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Showcase of enhanced input components with island styling, smooth transitions, and accessibility features.
        </p>
      </Island>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Inputs */}
        <FormGroup
          title="Basic Information"
          description="Please provide your basic contact information"
          layout="vertical"
          gap="md"
        >
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={!!errors.name}
            errorMessage={errors.name}
            size="md"
            elevation="low"
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={!!errors.email}
            errorMessage={errors.email}
            leftIcon={<EmailIcon />}
            size="md"
            elevation="low"
          />
        </FormGroup>

        {/* Input Variants */}
        <FormGroup
          title="Input Variants"
          description="Different styling variants for various use cases"
          layout="grid"
          columns={2}
          gap="md"
        >
          <Input
            label="Default Variant"
            placeholder="Default styling"
            variant="default"
          />

          <Input
            label="Filled Variant"
            placeholder="Filled background"
            variant="filled"
          />

          <Input
            label="Outline Variant"
            placeholder="Outline only"
            variant="outline"
          />

          <Input
            label="Ghost Variant"
            placeholder="Minimal styling"
            variant="ghost"
          />
        </FormGroup>

        {/* Input Sizes */}
        <FormGroup
          title="Input Sizes"
          description="Different sizes for various contexts"
          layout="vertical"
          gap="sm"
        >
          <Input
            label="Small Input"
            placeholder="Small size input"
            size="sm"
            leftIcon={<SearchIcon />}
          />

          <Input
            label="Medium Input (Default)"
            placeholder="Medium size input"
            size="md"
            leftIcon={<SearchIcon />}
          />

          <Input
            label="Large Input"
            placeholder="Large size input"
            size="lg"
            leftIcon={<SearchIcon />}
          />
        </FormGroup>

        {/* Floating Label */}
        <FormGroup
          title="Floating Labels"
          description="Modern floating label inputs"
          layout="grid"
          columns={2}
          gap="md"
        >
          <Input
            label="Floating Label"
            floatingLabel={true}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />

          <Input
            label="With Icon"
            floatingLabel={true}
            leftIcon={<SearchIcon />}
          />
        </FormGroup>

        {/* Textarea */}
        <FormGroup
          title="Message"
          description="Tell us more about your inquiry"
        >
          <Textarea
            label="Your Message"
            placeholder="Enter your message here..."
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            error={!!errors.message}
            errorMessage={errors.message}
            showCharCount={true}
            maxLength={500}
            size="md"
            elevation="low"
          />
        </FormGroup>

        {/* Select Dropdown */}
        <FormGroup
          title="Location"
          description="Select your country"
          layout="grid"
          columns={2}
          gap="md"
        >
          <Select
            label="Country (Native)"
            options={countryOptions}
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            error={!!errors.country}
            errorMessage={errors.country}
            placeholder="Select your country"
            leftIcon={<LocationIcon />}
            elevation="low"
          />

          <Select
            label="Country (Custom)"
            options={countryOptions}
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            placeholder="Select your country"
            leftIcon={<LocationIcon />}
            customDropdown={true}
            elevation="low"
          />
        </FormGroup>

        {/* Radio Group */}
        <FormGroup
          title="Theme Preference"
          description="Choose your preferred theme"
        >
          <RadioGroup
            name="theme"
            options={themeOptions}
            value={formData.theme}
            onChange={(value) => handleInputChange('theme', value)}
            layout="vertical"
            size="md"
            elevation="low"
          />
        </FormGroup>

        {/* Checkboxes */}
        <FormGroup
          title="Preferences"
          description="Select your communication preferences"
          layout="vertical"
          gap="md"
        >
          <Checkbox
            label="Enable Notifications"
            description="Receive important updates and alerts"
            checked={formData.notifications}
            onChange={(e) => handleInputChange('notifications', e.target.checked)}
            size="md"
            elevation="low"
          />

          <Checkbox
            label="Subscribe to Newsletter"
            description="Get weekly updates about new features and tips"
            checked={formData.newsletter}
            onChange={(e) => handleInputChange('newsletter', e.target.checked)}
            size="md"
            elevation="low"
          />
        </FormGroup>

        {/* Error State Demo */}
        <FormGroup
          title="Error State Demo"
          description="Example of form validation errors"
          error={Object.keys(errors).length > 0}
          errorMessage={Object.keys(errors).length > 0 ? "Please fix the errors above before submitting" : undefined}
        >
          <div className="text-sm text-[var(--color-text-secondary)]">
            Submit the form without filling required fields to see error states.
          </div>
        </FormGroup>

        {/* Submit Button */}
        <FormGroup>
          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              elevation="medium"
            >
              Submit Form
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                setFormData({
                  name: '',
                  email: '',
                  message: '',
                  country: '',
                  notifications: false,
                  theme: 'light',
                  newsletter: false,
                });
                setErrors({});
              }}
            >
              Reset Form
            </Button>
          </div>
        </FormGroup>
      </form>

      {/* Component Showcase */}
      <Island size="lg">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
          Component Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
              Input Features
            </h3>
            <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
              <li>• Multiple variants (default, filled, outline, ghost)</li>
              <li>• Three sizes (sm, md, lg)</li>
              <li>• Floating labels support</li>
              <li>• Left and right icons</li>
              <li>• Error states with messages</li>
              <li>• Helper text support</li>
              <li>• Island styling with elevation</li>
              <li>• Smooth focus transitions</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
              Accessibility Features
            </h3>
            <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
              <li>• Proper ARIA labels and descriptions</li>
              <li>• Keyboard navigation support</li>
              <li>• Focus indicators</li>
              <li>• Screen reader compatibility</li>
              <li>• High contrast error states</li>
              <li>• Semantic HTML structure</li>
              <li>• Form validation feedback</li>
              <li>• Reduced motion support</li>
            </ul>
          </div>
        </div>
      </Island>
    </div>
  );
};

export default InputDemo;