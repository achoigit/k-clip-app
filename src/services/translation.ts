
export const translateText = async (text: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=ko|en`
    );
    const data = await response.json();
    if (data.responseData) {
      return data.responseData.translatedText;
    }
    return 'Translation not found';
  } catch (error) {
    console.error('Translation error:', error);
    return 'Translation failed';
  }
};
