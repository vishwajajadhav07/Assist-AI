// =========================================
// ASSIST AI - MAIN JAVASCRIPT
// =========================================


// =========================================
// DOM ELEMENTS
// =========================================

const sendBtn = document.getElementById("sendBtn");

const promptBox = document.getElementById("prompt");

const messagesContainer =
    document.getElementById("messages");

const welcomeScreen =
    document.getElementById("welcomeScreen");

const typingIndicator =
    document.getElementById("typingIndicator");

const chatHistory =
    document.getElementById("chatHistory");

const newChatBtn =
    document.getElementById("newChatBtn");

const newChatTopBtn =
    document.getElementById("newChatTopBtn");

const clearHistoryBtn =
    document.getElementById("clearHistoryBtn");

const currentChatTitle =
    document.getElementById("currentChatTitle");

const menuBtn =
    document.getElementById("menuBtn");

const closeSidebarBtn =
    document.getElementById("closeSidebarBtn");

const sidebar =
    document.getElementById("sidebar");

const suggestionCards =
    document.querySelectorAll(".suggestion-card");


// =========================================
// APPLICATION STATE
// =========================================

let chats =
    JSON.parse(
        localStorage.getItem("assistAI_chats")
    ) || [];

let currentChatId = null;

let isGenerating = false;


// =========================================
// INITIALIZE APP
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderChatHistory();

        autoResizeTextarea();

    }
);


// =========================================
// CREATE NEW CHAT
// =========================================

function createNewChat() {

    const newChat = {

        id:
            Date.now().toString(),

        title:
            "New Chat",

        messages:
            [],

        createdAt:
            new Date().toISOString()

    };


    chats.unshift(newChat);


    currentChatId =
        newChat.id;


    saveChats();


    renderChatHistory();


    clearMessages();


    currentChatTitle.textContent =
        "New Chat";


    promptBox.focus();


    closeMobileSidebar();

}


// =========================================
// NEW CHAT BUTTONS
// =========================================

newChatBtn.addEventListener(
    "click",
    createNewChat
);


newChatTopBtn.addEventListener(
    "click",
    createNewChat
);


// =========================================
// CLEAR CURRENT MESSAGES
// =========================================

function clearMessages() {

    messagesContainer.innerHTML = "";


    welcomeScreen.style.display =
        "flex";


    typingIndicator.classList.add(
        "hidden"
    );

}


// =========================================
// SAVE CHATS
// =========================================

function saveChats() {

    localStorage.setItem(
        "assistAI_chats",
        JSON.stringify(chats)
    );

}


// =========================================
// RENDER CHAT HISTORY
// =========================================

function renderChatHistory() {

    chatHistory.innerHTML = "";


    if (chats.length === 0) {

        const emptyMessage =
            document.createElement("div");


        emptyMessage.style.padding =
            "20px 10px";


        emptyMessage.style.textAlign =
            "center";


        emptyMessage.style.color =
            "var(--text-muted)";


        emptyMessage.style.fontSize =
            "12px";


        emptyMessage.textContent =
            "No conversations yet";


        chatHistory.appendChild(
            emptyMessage
        );


        return;

    }


    chats.forEach(
        (chat) => {

            const historyItem =
                document.createElement("div");


            historyItem.className =
                "history-item";


            if (
                chat.id ===
                currentChatId
            ) {

                historyItem.classList.add(
                    "active"
                );

            }


            const icon =
                document.createElement("span");


            icon.className =
                "history-item-icon";


            icon.textContent =
                "💬";


            const title =
                document.createElement("span");


            title.className =
                "history-item-title";


            title.textContent =
                chat.title ||
                "New Chat";


            const deleteButton =
                document.createElement("button");


            deleteButton.className =
                "history-delete";


            deleteButton.textContent =
                "×";


            deleteButton.title =
                "Delete chat";


            deleteButton.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();


                    deleteChat(
                        chat.id
                    );

                }
            );


            historyItem.appendChild(
                icon
            );


            historyItem.appendChild(
                title
            );


            historyItem.appendChild(
                deleteButton
            );


            historyItem.addEventListener(
                "click",
                () => {

                    loadChat(
                        chat.id
                    );

                }
            );


            chatHistory.appendChild(
                historyItem
            );

        }
    );

}


// =========================================
// LOAD CHAT
// =========================================

function loadChat(chatId) {

    const chat =
        chats.find(
            (item) =>
                item.id === chatId
        );


    if (!chat) {

        return;

    }


    currentChatId =
        chatId;


    currentChatTitle.textContent =
        chat.title ||
        "New Chat";


    messagesContainer.innerHTML =
        "";


    if (
        chat.messages.length === 0
    ) {

        welcomeScreen.style.display =
            "flex";

    } else {

        welcomeScreen.style.display =
            "none";


        chat.messages.forEach(
            (message) => {

                addMessageToUI(
                    message.role,
                    message.content,
                    false
                );

            }
        );

    }


    renderChatHistory();


    closeMobileSidebar();


    scrollToBottom();

}


// =========================================
// DELETE CHAT
// =========================================

function deleteChat(chatId) {

    chats =
        chats.filter(
            (chat) =>
                chat.id !== chatId
        );


    saveChats();


    if (
        currentChatId === chatId
    ) {

        currentChatId =
            null;


        clearMessages();


        currentChatTitle.textContent =
            "New Chat";

    }


    renderChatHistory();

}


// =========================================
// CLEAR ALL CHAT HISTORY
// =========================================

clearHistoryBtn.addEventListener(
    "click",
    () => {

        if (
            chats.length === 0
        ) {

            return;

        }


        const confirmDelete =
            confirm(
                "Are you sure you want to delete all chat history?"
            );


        if (
            !confirmDelete
        ) {

            return;

        }


        chats = [];


        currentChatId =
            null;


        saveChats();


        clearMessages();


        currentChatTitle.textContent =
            "New Chat";


        renderChatHistory();

    }
);


// =========================================
// SEND MESSAGE
// =========================================

async function sendMessage() {

    const userMessage =
        promptBox.value.trim();


    if (
        !userMessage ||
        isGenerating
    ) {

        return;

    }


    // Create chat if no chat exists

    if (
        !currentChatId
    ) {

        createNewChat();

    }


    const currentChat =
        chats.find(
            (chat) =>
                chat.id ===
                currentChatId
        );


    if (!currentChat) {

        return;

    }


    // Hide welcome screen

    welcomeScreen.style.display =
        "none";


    // Add user message

    currentChat.messages.push({

        role:
            "user",

        content:
            userMessage

    });


    // Set chat title

    if (
        currentChat.title ===
        "New Chat"
    ) {

        currentChat.title =
            generateChatTitle(
                userMessage
            );

    }


    saveChats();


    renderChatHistory();


    currentChatTitle.textContent =
        currentChat.title;


    addMessageToUI(
        "user",
        userMessage,
        true
    );


    // Clear input

    promptBox.value =
        "";


    autoResizeTextarea();


    scrollToBottom();


    // Show typing indicator

    showTyping();


    isGenerating =
        true;


    sendBtn.disabled =
        true;


    try {

        // Prepare messages for API

        const apiMessages = [

            {

                role:
                    "system",

                content:
                    "You are Assist AI, a helpful, intelligent, friendly AI assistant. Give accurate, clear, and useful answers. Use markdown formatting when helpful."

            },

            ...currentChat.messages

        ];


        // Call backend

        const response =
            await fetch(
                "/api/chat",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            messages:
                                apiMessages

                        })

                }
            );


        const data =
            await response.json();


        if (
            !response.ok
        ) {

            throw new Error(
                data.error ||
                "Failed to get AI response"
            );

        }


        // Hide typing

        hideTyping();


        const aiResponse =
            data.message ||
            "Sorry, I couldn't generate a response.";


        // Add AI message to chat

        currentChat.messages.push({

            role:
                "assistant",

            content:
                aiResponse

        });


        saveChats();


        // Display AI response

        await addAIMessageWithTyping(
            aiResponse
        );


        renderChatHistory();


    } catch (error) {

        console.error(
            "Error:",
            error
        );


        hideTyping();


        const errorMessage =
            "Sorry, something went wrong. Please check your GitHub token and server connection.";


        currentChat.messages.push({

            role:
                "assistant",

            content:
                errorMessage

        });


        saveChats();


        addMessageToUI(
            "assistant",
            errorMessage,
            true
        );

    } finally {

        isGenerating =
            false;


        sendBtn.disabled =
            false;


        promptBox.focus();

    }

}


// =========================================
// SEND BUTTON CLICK
// =========================================

sendBtn.addEventListener(
    "click",
    sendMessage
);


// =========================================
// ENTER TO SEND
// SHIFT + ENTER = NEW LINE
// =========================================

promptBox.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key ===
                "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();


            sendMessage();

        }

    }
);


// =========================================
// TEXTAREA AUTO RESIZE
// =========================================

promptBox.addEventListener(
    "input",
    autoResizeTextarea
);


function autoResizeTextarea() {

    promptBox.style.height =
        "auto";


    promptBox.style.height =
        Math.min(
            promptBox.scrollHeight,
            150
        ) + "px";

}


// =========================================
// ADD MESSAGE TO UI
// =========================================

function addMessageToUI(
    role,
    content,
    scroll = true
) {

    const messageElement =
        document.createElement("div");


    messageElement.className =
        "message";


    if (
        role === "user"
    ) {

        messageElement.classList.add(
            "user"
        );

    } else {

        messageElement.classList.add(
            "ai"
        );

    }


    // Avatar

    const avatar =
        document.createElement("div");


    avatar.className =
        "message-avatar";


    if (
        role === "user"
    ) {

        avatar.classList.add(
            "user-avatar-message"
        );


        avatar.textContent =
            "V";

    } else {

        avatar.classList.add(
            "ai-avatar"
        );


        avatar.textContent =
            "✦";

    }


    // Content wrapper

    const contentWrapper =
        document.createElement("div");


    contentWrapper.className =
        "message-content";


    // Role name

    const roleLabel =
        document.createElement("div");


    roleLabel.className =
        "message-role";


    roleLabel.textContent =
        role === "user"
            ? "You"
            : "Assist AI";


    // Message text

    const messageText =
        document.createElement("div");


    messageText.className =
        "message-text";


    messageText.innerHTML =
        formatMessage(
            content
        );


    contentWrapper.appendChild(
        roleLabel
    );


    contentWrapper.appendChild(
        messageText
    );


    // AI actions

    if (
        role !== "user"
    ) {

        const actions =
            document.createElement("div");


        actions.className =
            "message-actions";


        const copyButton =
            document.createElement("button");


        copyButton.className =
            "message-action-btn";


        copyButton.textContent =
            "📋 Copy";


        copyButton.addEventListener(
            "click",
            () => {

                navigator.clipboard.writeText(
                    content
                );


                copyButton.textContent =
                    "✓ Copied";


                setTimeout(
                    () => {

                        copyButton.textContent =
                            "📋 Copy";

                    },
                    1500
                );

            }
        );


        actions.appendChild(
            copyButton
        );


        contentWrapper.appendChild(
            actions
        );

    }


    messageElement.appendChild(
        avatar
    );


    messageElement.appendChild(
        contentWrapper
    );


    messagesContainer.appendChild(
        messageElement
    );


    if (
        scroll
    ) {

        scrollToBottom();

    }


    return messageElement;

}


// =========================================
// AI TYPING RESPONSE
// =========================================

async function addAIMessageWithTyping(
    content
) {

    const messageElement =
        document.createElement("div");


    messageElement.className =
        "message ai";


    const avatar =
        document.createElement("div");


    avatar.className =
        "message-avatar ai-avatar";


    avatar.textContent =
        "✦";


    const contentWrapper =
        document.createElement("div");


    contentWrapper.className =
        "message-content";


    const roleLabel =
        document.createElement("div");


    roleLabel.className =
        "message-role";


    roleLabel.textContent =
        "Assist AI";


    const messageText =
        document.createElement("div");


    messageText.className =
        "message-text";


    contentWrapper.appendChild(
        roleLabel
    );


    contentWrapper.appendChild(
        messageText
    );


    messageElement.appendChild(
        avatar
    );


    messageElement.appendChild(
        contentWrapper
    );


    messagesContainer.appendChild(
        messageElement
    );


    // Type response

    const words =
        content.split(" ");


    let currentText =
        "";


    for (
        let i = 0;
        i < words.length;
        i++
    ) {

        currentText +=
            (
                i === 0
                    ? ""
                    : " "
            ) +
            words[i];


        messageText.innerHTML =
            formatMessage(
                currentText
            );


        scrollToBottom();


        await sleep(
            15
        );

    }


    // Add copy button

    const actions =
        document.createElement("div");


    actions.className =
        "message-actions";


    const copyButton =
        document.createElement("button");


    copyButton.className =
        "message-action-btn";


    copyButton.textContent =
        "📋 Copy";


    copyButton.addEventListener(
        "click",
        () => {

            navigator.clipboard.writeText(
                content
            );


            copyButton.textContent =
                "✓ Copied";


            setTimeout(
                () => {

                    copyButton.textContent =
                        "📋 Copy";

                },
                1500
            );

        }
    );


    actions.appendChild(
        copyButton
    );


    contentWrapper.appendChild(
        actions
    );

}


// =========================================
// FORMAT MESSAGE
// =========================================

function formatMessage(text) {

    if (!text) {

        return "";

    }


    let formatted =
        escapeHTML(
            text
        );


    // Code blocks

    formatted =
        formatted.replace(
            /```([\s\S]*?)```/g,
            "<pre><code>$1</code></pre>"
        );


    // Bold

    formatted =
        formatted.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    // Italic

    formatted =
        formatted.replace(
            /\*(.*?)\*/g,
            "<em>$1</em>"
        );


    // Inline code

    formatted =
        formatted.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );


    // Line breaks

    formatted =
        formatted.replace(
            /\n/g,
            "<br>"
        );


    return formatted;

}


// =========================================
// ESCAPE HTML
// =========================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


// =========================================
// GENERATE CHAT TITLE
// =========================================

function generateChatTitle(
    message
) {

    let title =
        message.trim();


    if (
        title.length >
        30
    ) {

        title =
            title.substring(
                0,
                30
            ) +
            "...";

    }


    return title;

}


// =========================================
// TYPING INDICATOR
// =========================================

function showTyping() {

    typingIndicator.classList.remove(
        "hidden"
    );


    scrollToBottom();

}


function hideTyping() {

    typingIndicator.classList.add(
        "hidden"
    );

}


// =========================================
// SCROLL TO BOTTOM
// =========================================

function scrollToBottom() {

    setTimeout(
        () => {

            const chatContainer =
                document.getElementById(
                    "chatContainer"
                );


            chatContainer.scrollTo({

                top:
                    chatContainer.scrollHeight,

                behavior:
                    "smooth"

            });

        },
        50
    );

}


// =========================================
// SLEEP FUNCTION
// =========================================

function sleep(
    milliseconds
) {

    return new Promise(
        (resolve) => {

            setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}


// =========================================
// SUGGESTION CARDS
// =========================================

suggestionCards.forEach(
    (card) => {

        card.addEventListener(
            "click",
            () => {

                const prompt =
                    card.dataset.prompt;


                promptBox.value =
                    prompt;


                autoResizeTextarea();


                promptBox.focus();

            }
        );

    }
);


// =========================================
// MOBILE SIDEBAR
// =========================================

menuBtn.addEventListener(
    "click",
    () => {

        sidebar.classList.add(
            "open"
        );

    }
);


closeSidebarBtn.addEventListener(
    "click",
    closeMobileSidebar
);


function closeMobileSidebar() {

    sidebar.classList.remove(
        "open"
    );

}


// =========================================
// CLOSE SIDEBAR WHEN CLICKING OUTSIDE
// =========================================

document.addEventListener(
    "click",
    (event) => {

        if (
            window.innerWidth <=
            768
        ) {

            if (
                sidebar.classList.contains(
                    "open"
                ) &&
                !sidebar.contains(
                    event.target
                ) &&
                !menuBtn.contains(
                    event.target
                )
            ) {

                closeMobileSidebar();

            }

        }

    }
);