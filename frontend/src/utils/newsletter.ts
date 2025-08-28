export const subscribeToNewsletter = async (email: string, firstName?: string) => {
  try {
    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, firstName }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'inscription');
    }

    return data;
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    throw error;
  }
};
