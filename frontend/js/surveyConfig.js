export const loginJson = {
  title: "Login",
  elements: [
    {
      type: "text",
      name: "username",
      title: "Username:",
      isRequired: true,
      placeholder: "Enter your username",
    },
    {
      type: "text",
      name: "password",
      title: "Password:",
      isRequired: true,
      inputType: "password",
      placeholder: "Enter your password",
    },
  ],
  showQuestionNumbers: false,
  completeText: "Login",
};

export const registerJson = {
  title: "Register",
  elements: [
    {
      type: "text",
      name: "username",
      title: "Username:",
      isRequired: true,
      placeholder: "Choose a username",
    },
    {
      type: "text",
      name: "password",
      title: "Password:",
      isRequired: true,
      inputType: "password",
      placeholder: "Choose a password",
    },
    {
      type: "boolean",
      name: "isAdmin",
      title: "Is Admin User?",
      labelTrue: "Yes",
      labelFalse: "No",
      defaultValue: false
    }
  ],
  showQuestionNumbers: false,
  completeText: "Register",
};

export const todoAddJson = {
  elements: [
    {
      type: "text",
      name: "title",
      title: "Title:",
      isRequired: true,
      placeholder: "Enter todo title",
    },
  ],
  showQuestionNumbers: false,
  completeText: "Add Todo",
};

export const todoUpdateJson = {
  elements: [
    {
      type: "text",
      name: "title",
      title: "Title:",
      isRequired: true,
      maxLength: 255,
    },
    {
      type: "tagbox",
      name: "categories",
      title: "Categories:",
      isRequired: false,
      choices: [],
    },
  ],
};

export const categoryAddJson = {
  elements: [
    {
      type: "text",
      name: "title",
      title: "Title:",
      isRequired: true,
      placeholder: "Enter category title",
    },
  ],
  showQuestionNumbers: false,
  completeText: "Add Category",
};

export const categoryUpdateJson = {
  elements: [
    {
      type: "text",
      name: "title",
      title: "Title:",
      isRequired: true,
      maxLength: 255,
    }
  ],
};
