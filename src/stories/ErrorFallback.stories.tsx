import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { ErrorFallback } from 'components/ErrorFallback/ErrorFallback';

const meta: Meta = {
  title: 'Components/ErrorFallback',
  component: ErrorFallback
};

export default meta;

const Template: StoryFn = (args) => <ErrorFallback {...args} />;

export const Default = Template.bind({});
Default.args = {
  message: 'This is a default error message'
};

export const WithReset = Template.bind({});
WithReset.args = {
  message: 'This is an error with a reset button',
  onReset: () => alert('Reset button clicked!')
};
