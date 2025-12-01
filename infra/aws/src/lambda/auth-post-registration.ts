import { PostConfirmationTriggerEvent } from 'aws-lambda';

export const handler = (event: PostConfirmationTriggerEvent) => {
  console.info('Post-registration triggered for user', {
    userName: event.userName,
    userAttributes: event.request.userAttributes,
  });

  const { sub: userId, email } = event.request.userAttributes;
  const username = event.userName;

  try {
    // TODO: Create user profile in database
    console.info('User profile created successfully', { userId });

    // Always return the event for Cognito triggers
    return event;
  } catch (error) {
    console.error('Error creating user profile in DynamoDB', { error });

    // Cognito requires the event to be returned even on error
    // If you throw an error, the user registration will fail
    return event;
  }
};
