export const loginJson = {
    elements: [
        {
            type: "text",
            name: "username",
            title: "Username:",
            isRequired: true,
            placeholder: "Enter your username"
        },
        {
            type: "text",
            name: "password",
            title: "Password:",
            isRequired: true,
            inputType: "password",
            placeholder: "Enter your password"
        }
    ],
    showQuestionNumbers: false,
    completeText: "Login"
};

export const registerJson = {
    elements: [
        {
            type: "text",
            name: "username",
            title: "Username:",
            isRequired: true,
            placeholder: "Choose a username"
        },
        {
            type: "text",
            name: "password",
            title: "Password:",
            isRequired: true,
            inputType: "password",
            placeholder: "Choose a password"
        }
    ],
    showQuestionNumbers: false,
    completeText: "Register"
};



export const todoAddJson = {
    elements: [
        {
            type: "text",
            name: "title",
            title: "Title:",
            isRequired: true,
            placeholder: "Enter todo title"
        },
       
    ],
    showQuestionNumbers: false,
    completeText: "Add Todo"


}
