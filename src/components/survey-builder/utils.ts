
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const convertToSurveyJSFormat = (survey: any) => {
  const result: any = {
    title: survey.title,
    description: survey.description,
    showProgressBar: survey.showProgressBar ? "top" : "off",
    logoPosition: survey.logoPosition || "right",
    pages: []
  };

  if (survey.logo) {
    result.logo = survey.logo;
  }

  // Convert pages
  result.pages = survey.pages.map((page: any) => {
    const resultPage: any = {
      name: `page${page.id}`,
      elements: []
    };

    if (page.title) {
      resultPage.title = page.title;
    }

    if (page.description) {
      resultPage.description = page.description;
    }

    // Convert questions
    resultPage.elements = page.questions.map((question: any) => {
      const baseElement: any = {
        name: question.id,
        title: question.title,
        type: question.type,
        isRequired: question.isRequired || false
      };

      if (question.description) {
        baseElement.description = question.description;
      }

      // Add type-specific properties
      switch (question.type) {
        case 'rating':
          if (question.rateMax) baseElement.rateMax = question.rateMax;
          if (question.rateMin) baseElement.rateMin = question.rateMin;
          if (question.rateStep) baseElement.rateStep = question.rateStep;
          if (question.rateType) baseElement.rateType = question.rateType;
          break;
        case 'boolean':
          if (question.labelTrue) baseElement.labelTrue = question.labelTrue;
          if (question.labelFalse) baseElement.labelFalse = question.labelFalse;
          break;
        case 'text':
        case 'comment':
          if (question.placeholder) baseElement.placeholder = question.placeholder;
          if (question.type === 'text' && question.maxLength) {
            baseElement.maxLength = question.maxLength;
          }
          if (question.type === 'comment' && question.rows) {
            baseElement.rows = question.rows;
          }
          break;
      }

      return baseElement;
    });

    return resultPage;
  });

  return result;
};

export const parseSurveyJSFormat = (surveyJS: any) => {
  const result: any = {
    title: surveyJS.title || 'Untitled Survey',
    description: surveyJS.description || '',
    showProgressBar: surveyJS.showProgressBar && surveyJS.showProgressBar !== "off",
    logoPosition: surveyJS.logoPosition || "right",
    logo: surveyJS.logo || '',
    pages: []
  };

  // Convert pages
  result.pages = surveyJS.pages.map((page: any, index: number) => {
    const resultPage: any = {
      id: page.name || `page${index + 1}`,
      title: page.title || `Page ${index + 1}`,
      description: page.description || '',
      questions: []
    };

    // Convert elements to questions
    if (page.elements) {
      resultPage.questions = page.elements.map((element: any) => {
        const baseQuestion: any = {
          id: element.name || generateId(),
          title: element.title || 'Untitled Question',
          type: element.type,
          isRequired: element.isRequired || false,
          description: element.description || ''
        };

        // Add type-specific properties
        switch (element.type) {
          case 'rating':
            baseQuestion.rateMax = element.rateMax || 5;
            baseQuestion.rateMin = element.rateMin || 1;
            baseQuestion.rateStep = element.rateStep || 1;
            baseQuestion.rateType = element.rateType || 'stars';
            break;
          case 'boolean':
            baseQuestion.labelTrue = element.labelTrue || 'Yes';
            baseQuestion.labelFalse = element.labelFalse || 'No';
            break;
          case 'text':
            baseQuestion.placeholder = element.placeholder || '';
            baseQuestion.maxLength = element.maxLength || undefined;
            break;
          case 'comment':
            baseQuestion.placeholder = element.placeholder || '';
            baseQuestion.rows = element.rows || undefined;
            break;
        }

        return baseQuestion;
      });
    }

    return resultPage;
  });

  return result;
};
