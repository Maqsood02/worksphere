/* AI Assistant Floating Chat Script: AlexDev Platform */

let chatOpen = false;

function toggleAiChat(forceState) {
    const drawer = document.getElementById("ai-chat-drawer");
    const icon = document.getElementById("chat-fab-icon");
    
    if(!drawer || !icon) return;

    chatOpen = forceState !== undefined ? forceState : !chatOpen;

    if (chatOpen) {
        // Open chat drawer
        drawer.classList.remove("pointer-events-none", "translate-y-8", "opacity-0", "scale-95");
        icon.setAttribute("data-lucide", "x");
        
        // Load initial thread
        syncAiChatLogs();
    } else {
        // Close chat drawer
        drawer.classList.add("pointer-events-none", "translate-y-8", "opacity-0", "scale-95");
        icon.setAttribute("data-lucide", "message-square");
    }
    
    lucide.createIcons();
}

async function syncAiChatLogs() {
    const messageContainer = document.getElementById("ai-chat-messages");
    if (!messageContainer) return;

    try {
        const response = await fetch("/api/chat/history?withUser=ai");
        const data = await response.json();

        if (response.ok && data.success) {
            let htmlContent = `
                <div class="flex items-start space-x-2">
                    <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <i data-lucide="bot" class="w-4 h-4 text-primary"></i>
                    </div>
                    <div class="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm text-text-dark">
                        👋 Hello! I am your AI Co-Pilot. Ask me about pricing, coupon codes, active project statuses, or technology stacks!
                    </div>
                </div>
            `;

            data.history.forEach(msg => {
                const isAi = msg.senderId === "ai";
                const alignment = isAi ? "justify-start text-left" : "justify-end text-right";
                const bubbleColor = isAi ? "bg-white text-text-dark rounded-tl-none border border-slate-100" : "bg-primary text-white rounded-tr-none ml-auto";
                const iconOrDot = isAi ? 
                    `<div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><i data-lucide="bot" class="w-4 h-4 text-primary"></i></div>` : "";
                
                htmlContent += `
                    <div class="flex items-start space-x-2 ${alignment}">
                        ${iconOrDot}
                        <div class="p-3 rounded-2xl shadow-sm text-xs max-w-[80%] inline-block ${bubbleColor}">
                            ${msg.content}
                        </div>
                    </div>
                `;
            });

            messageContainer.innerHTML = htmlContent;
            messageContainer.scrollTop = messageContainer.scrollHeight;
            lucide.createIcons();
        }
    } catch(err) {
        console.error("AI Sync Error:", err);
    }
}

async function sendAiMessage() {
    const input = document.getElementById("ai-chat-input");
    const content = input.value.trim();
    if (!content) return;

    input.value = "";
    
    // Optimistic user display
    appendAiChatMessage("You", content, false);

    // Show Typing Indicator
    const typingIndicator = document.getElementById("ai-chat-typing");
    typingIndicator.classList.remove("hidden");

    try {
        const response = await fetch("/api/chat/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                receiverId: "ai",
                content: content
            })
        });

        if (response.ok) {
            // Wait slightly for natural typewriter feel, then sync chat thread
            setTimeout(async () => {
                typingIndicator.classList.add("hidden");
                await syncAiChatLogs();
            }, 1200);
        } else {
            typingIndicator.classList.add("hidden");
            showToast("Failed to transmit query. Authenticate first.");
        }
    } catch (err) {
        typingIndicator.classList.add("hidden");
        console.error("AI send error:", err);
    }
}

function appendAiChatMessage(sender, text, isAi) {
    const container = document.getElementById("ai-chat-messages");
    if (!container) return;

    const alignClass = isAi ? "" : "justify-end text-right";
    const bubbleClass = isAi ? "bg-white text-text-dark border" : "bg-primary text-white ml-auto rounded-tr-none";
    const icon = isAi ? `<div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><i data-lucide="bot" class="w-4 h-4 text-primary"></i></div>` : "";

    const messageHtml = `
        <div class="flex items-start space-x-2 ${alignClass}">
            ${icon}
            <div class="p-3 rounded-2xl shadow-sm text-xs max-w-[80%] inline-block ${bubbleClass}">
                ${text}
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', messageHtml);
    container.scrollTop = container.scrollHeight;
    lucide.createIcons();
}
