/* Keyboard Shortcut Command Palette: AlexDev Platform */

let paletteOpen = false;

document.addEventListener("keydown", (e) => {
    // Check for Ctrl + K or Cmd + K
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCommandPalette();
    }
    // Close on escape
    if (e.key === "Escape" && paletteOpen) {
        toggleCommandPalette(false);
    }
});

function toggleCommandPalette(forceState) {
    const palette = document.getElementById("command-palette");
    const modal = document.getElementById("palette-modal");
    const search = document.getElementById("palette-search");
    
    if(!palette || !modal) return;

    paletteOpen = forceState !== undefined ? forceState : !paletteOpen;

    if (paletteOpen) {
        palette.classList.remove("hidden");
        setTimeout(() => {
            modal.classList.remove("scale-95", "opacity-0");
            search.focus();
        }, 50);
    } else {
        modal.classList.add("scale-95", "opacity-0");
        setTimeout(() => {
            palette.classList.add("hidden");
            search.value = "";
            filterCommands(); // Reset list
        }, 300);
    }
}

function filterCommands() {
    const query = document.getElementById("palette-search").value.toLowerCase();
    const items = document.querySelectorAll(".palette-item");
    
    items.forEach(item => {
        const text = item.innerText.toLowerCase();
        if (text.includes(query)) {
            item.style.display = "flex";
        } else {
            item.style.display = "none";
        }
    });
}

function paletteNavigate(url) {
    toggleCommandPalette(false);
    
    if(url.startsWith("/#")) {
        // Handle scroll targets directly on home page
        const anchor = url.split("#")[1];
        const element = document.getElementById(anchor);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        } else {
            window.location.href = url;
        }
    } else {
        window.location.href = url;
    }
}

function triggerAiAssistant() {
    toggleCommandPalette(false);
    // Tiny delay to allow backdrop fade
    setTimeout(() => {
        toggleAiChat(true);
    }, 200);
}
