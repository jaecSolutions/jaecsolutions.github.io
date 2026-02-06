// chat-widget.js
class ChatWidget {
    constructor(agentId, lang = 'fr', customConfig = {}) {
        this.agentId = agentId;
        this.lang = lang;
        this.isOpen = false;
        this.isMobile = window.innerWidth <= 600;
        this.touchStartY = 0;
        this.touchCurrentY = 0;
        this.isDragging = false;
        this.config = {
            theme: 'light',
            primaryColor: '#000000',
            position: {
                desktop: 'bottom-right',
                mobile: 'bottom-right'
            },
            buttonSize: {
                desktop: {
                    height: '60px'
                },
                mobile: {
                    height: '60px'
                }
            },
            spacing: {
                desktop: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                },
                mobile: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                }
            },
            ...customConfig
        };
        this.API_URL = 'https://factory.wearegenial.com';
        this.init();
    }
    async init() {
        await this.fetchAgentConfig();
        this.createWidgetElements();
        this.setupEventListeners();
    }
    async fetchAgentConfig() {
        try {
            const res = await fetch(`${this.API_URL}/api/external/agents/${this.agentId}`);
            const data = await res.json();
            this.agentName = data.displayName || data.name;
            this.agentIconUrl = data.iconUrl;
            const agentConfig = data?.interfaceConfig;
            if (agentConfig) {
                this.config.primaryColor = agentConfig.primaryColor || this.config.primaryColor;
                if (agentConfig.position && typeof agentConfig.position === 'object') {
                    this.config.position = {
                        desktop: agentConfig.position.desktop || this.config.position.desktop,
                        mobile: agentConfig.position.mobile || this.config.position.mobile
                    };
                }
                this.config.backgroundColor = agentConfig.user?.backgroundColor || agentConfig.primaryColor;
            }
        } catch (error) {
            console.error('Failed to fetch agent config:', error);
        }
    }
    createWidgetElements() {
        // Create button container
        this.container = document.createElement('div');
        this.container.className = 'chat-widget-container-genial';
        
        // Create button
        this.button = document.createElement('button');
        this.button.className = 'chat-widget-button-genial';

        if (this.agentId === 'cm5uujxpo002p0qnt9qdj8cig') {
            this.button.classList.add('bold-agent-name');
        }
        this.button.innerHTML = `
            <div class="button-content-genial">
                <img width="20" height="20" src="${this.agentIconUrl}" alt="${this.agentName}"/>
                <span class="agent-name-genial">${this.agentName}</span>
            </div>`;
            
        // Add button to container
        this.container.appendChild(this.button);
        document.body.appendChild(this.container);
        
        // Create chat iframe container SEPARATELY from the button container
        this.chatBox = document.createElement('div');
        this.chatBox.className = 'chat-widget-box';
        this.chatBox.style.display = 'none';
        
        // Create mobile slide indicator (only visible on mobile)
        this.slideIndicator = document.createElement('div');
        this.slideIndicator.className = 'chat-slide-indicator-mobile';
        this.slideIndicator.innerHTML = `
            <div class="slide-handle"></div>
            <span class="slide-text">Glissez vers le bas pour fermer</span>
        `;
        
        // Create iframe
        this.iframe = document.createElement('iframe');
        this.iframe.src = `${this.API_URL}/agents/${this.agentId}/iframe/?lang=${this.lang}`;
        this.iframe.allow = 'microphone';
        this.iframe.style.width = '100%';
        this.iframe.style.height = '100%';
        this.iframe.style.border = 'none';
        this.iframe.style.borderRadius = '8px';
        
        // Append elements
        this.chatBox.appendChild(this.slideIndicator);
        this.chatBox.appendChild(this.iframe);
        
        // Add chat box directly to body, NOT inside the button container
        document.body.appendChild(this.chatBox);
        this.applyStyles();
    }
    applyStyles() {
        // Convert hex to rgba for the glow effect
        const hexToRgba = (hex, alpha) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        const primaryColorRgba50 = hexToRgba(this.config.primaryColor, 0.5);
        const primaryColorRgba30 = hexToRgba(this.config.primaryColor, 0.3);
        const primaryColorRgba60 = hexToRgba(this.config.primaryColor, 0.6);
        const primaryColorRgba40 = hexToRgba(this.config.primaryColor, 0.4);
        
        const positionStyles = this.getPositionStyles();
        const chatBoxPosition = this.getChatBoxPosition();
        
        const styles = `
            .chat-widget-container-genial {
                position: fixed;
                ${Object.entries(positionStyles.desktop).map(([key, value]) => `${key}: ${value}`).join('; ')};
                z-index: 2147483647 !important;
            }
            
            .chat-widget-button-genial {
                width: auto !important;
                height: ${this.config.buttonSize.desktop.height} !important;
                border-radius: 40px !important;
                background-color: ${this.config.backgroundColor} !important;
                border: none !important;
                cursor: pointer !important;
                padding: 0 !important;
                display: flex !important;
                align-items: center !important;
                transition: all 0.3s ease;
                box-shadow: 0 0 10px ${primaryColorRgba50} !important,
                            0 0 20px ${primaryColorRgba30} !important;
                z-index: 9999999999 !important;
                position: relative !important;
            }
            
            .chat-widget-button-genial:hover {
                transform: scale(1.05) !important;
                box-shadow: 0 0 15px ${primaryColorRgba60} !important,
                            0 0 30px ${primaryColorRgba40} !important;
            }
            
            .button-content-genial {
                display: flex !important;
                align-items: center !important;
                padding-right: 16px !important;
                height: 100% !important;
            }
            
            .chat-widget-button-genial img {
                width: 36px !important;
                height: 36px !important;
                border-radius: 50% !important;
                object-fit: cover !important;
                margin-left: 12px !important;
                margin-right: 12px !important;
            }
            
            .agent-name-genial {
                color: white !important;
                font-size: 16px !important;
                font-weight: 500 !important;
            }
            
            .bold-agent-name .agent-name-genial {
                font-weight: bold !important;
            }
            
            .chat-widget-box {
                position: fixed !important;
                ${chatBoxPosition.desktop}
                width: 500px !important;
                height: 80vh !important;
                // max-height: 700px !important;
                min-height: 450px !important;
                background: white !important;
                border-radius: 8px !important;
                box-shadow: 0 2px 12px rgba(0,0,0,0.15) !important;
                z-index: 2147483647 !important;
                pointer-events: auto !important;
                touch-action: auto !important;
                margin-bottom: 20px !important;
            }
            
            .chat-widget-box iframe {
                width: 100% !important;
                height: 100% !important;
                border: none !important;
                border-radius: 8px !important;
            }
            
            .chat-slide-indicator-mobile {
                display: none !important;
            }
            
            @media (max-width: 600px) {
                .chat-widget-container-genial {
                    ${Object.entries(positionStyles.mobile).map(([key, value]) => `${key}: ${value}`).join('; ')};
                    z-index: 2147483649 !important;
                }
                
                .chat-widget-container-genial.mobile-chat-open {
                    display: none !important;
                }
                
                .chat-widget-button-genial {
                    width: auto !important;
                    height: ${this.config.buttonSize.mobile.height} !important;
                    z-index: 2147483649 !important;
                    position: relative !important;
                }
                
                .chat-widget-box {
                    position: fixed !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    border: none !important;
                    border-radius: 0 !important;
                    box-shadow: none !important;
                    max-width: 100vw !important;
                    min-width: 100vw !important;
                    min-height: 100vh !important;
                    z-index: 2147483647 !important;
                    pointer-events: auto !important;
                    touch-action: pan-y !important;
                    transition: transform 0.3s ease !important;
                    overflow: hidden !important;
                }
                
                .chat-slide-indicator-mobile {
                    display: flex !important;
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    width: 100% !important;
                    height: 40px !important;
                    background: white !important;
                    z-index: 2147483648 !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                    cursor: pointer !important;
                    border-radius: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    box-sizing: border-box !important;
                    border-bottom: 1px solid rgba(0,0,0,0.1) !important;
                }
                
                .slide-handle {
                    width: 30px !important;
                    height: 3px !important;
                    background: ${this.config.backgroundColor || this.config.primaryColor} !important;
                    border-radius: 2px !important;
                    margin-bottom: 4px !important;
                }
                
                .slide-text {
                    color: ${this.config.backgroundColor || this.config.primaryColor} !important;
                    font-size: 10px !important;
                    font-weight: 500 !important;
                    text-align: center !important;
                }
                
                .chat-widget-box iframe {
                    position: absolute !important;
                    top: 40px !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    width: 100% !important;
                    height: calc(100% - 40px) !important;
                    border: none !important;
                    border-radius: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    box-sizing: border-box !important;
                }

            }
            .button-content-genial.close-content {
            justify-content: center !important;
            width: 60px !important;
            padding: 0 !important;
            z-index: 9999999999 !important;
        }

        .chat-widget-button-genial.is-open {
            width: 60px !important;
            padding: 0 !important;
        }
        
        /* Make sure the button is properly visible when chat is open */
        // @media (min-width: 601px) {
        //     .chat-widget-button-genial.is-open {
        //         margin-top: 20px !important;
        //     }
        // }
        `;
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    setupEventListeners() {
        this.button.addEventListener('click', () => this.toggleChat());
        
        // Add mobile slide gesture listeners
        if (this.isMobile) {
            this.slideIndicator.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
            this.slideIndicator.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
            this.slideIndicator.addEventListener('touchend', () => this.handleTouchEnd(), { passive: false });
            this.slideIndicator.addEventListener('click', () => this.toggleChat());
        }
        
        // Update mobile detection on resize
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 600;
        });
    }
    toggleChat() {
        this.isOpen = !this.isOpen;
        this.chatBox.style.display = this.isOpen ? 'block' : 'none';
        
        if (this.isOpen) {
            const [desktopVPos] = this.config.position.desktop.split('-');
            const buttonRect = this.button.getBoundingClientRect();
            if (desktopVPos === 'bottom') {
                const bottomOffset = window.innerHeight - buttonRect.top;
                this.chatBox.style.setProperty('bottom', `${bottomOffset}px`, 'important');
            } else {
                const topOffset = buttonRect.bottom;
                this.chatBox.style.setProperty('top', `${topOffset}px`, 'important');
            }
            this.button.classList.add('is-open');
            
            // Hide button container on mobile when chat is open
            if (this.isMobile) {
                this.container.classList.add('mobile-chat-open');
            }
        } else {
            this.button.classList.remove('is-open');
            
            // Show button container on mobile when chat is closed
            if (this.isMobile) {
                this.container.classList.remove('mobile-chat-open');
            }
        }
        
        // On mobile, keep the original button appearance, on desktop show close button
        if (this.isMobile) {
            // Keep original button appearance on mobile
            this.button.innerHTML = `<div class="button-content-genial">
                <img width="20" height="20" src="${this.agentIconUrl}" alt="${this.agentName}"/>
                <span class="agent-name-genial">${this.agentName}</span>
            </div>`;
        } else {
            // Show close button on desktop
            this.button.innerHTML = this.isOpen ?
                `<div class="button-content-genial close-content">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18"/>
                        <path d="m6 6 12 12"/>
                    </svg>
                </div>` :
                `<div class="button-content-genial">
                    <img width="20" height="20" src="${this.agentIconUrl}" alt="${this.agentName}"/>
                    <span class="agent-name-genial">${this.agentName}</span>
                </div>`;
        }
    }
    
    handleTouchStart(e) {
        this.touchStartY = e.touches[0].clientY;
        this.isDragging = true;
    }
    
    handleTouchMove(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        this.touchCurrentY = e.touches[0].clientY;
        const deltaY = this.touchCurrentY - this.touchStartY;
        
        // Only allow downward dragging
        if (deltaY > 0) {
            const translateY = Math.min(deltaY, 200); // Limit max drag distance
            this.chatBox.style.transform = `translateY(${translateY}px)`;
        }
    }
    
    handleTouchEnd() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        const deltaY = this.touchCurrentY - this.touchStartY;
        
        // Close chat if dragged down more than 100px
        if (deltaY > 100) {
            this.toggleChat();
        }
        
        // Reset transform
        this.chatBox.style.transform = 'translateY(0)';
    }
    
    startShakeAnimation() {
        // Empty function - removing animation
    }
    getPositionStyles() {
        const { position, spacing } = this.config;
        // Ensure position properties exist and are valid strings
        const desktopPos = position?.desktop || 'bottom-right';
        const mobilePos = position?.mobile || 'bottom-right';
        
        const [desktopVPos, desktopHPos] = desktopPos.split('-'); // e.g., 'bottom-right' -> ['bottom', 'right']
        const [mobileVPos, mobileHPos] = mobilePos.split('-'); // e.g., 'bottom-right' -> ['bottom', 'right']
        
        return {
            desktop: {
                [desktopVPos]: spacing.desktop[desktopVPos],
                [desktopHPos]: spacing.desktop[desktopHPos]
            },
            mobile: {
                [mobileVPos]: spacing.mobile[mobileVPos],
                [mobileHPos]: spacing.mobile[mobileHPos]
            }
        };
    }
    
    getChatBoxPosition() {
        const { position } = this.config;
        // Ensure position properties exist and are valid strings
        const desktopPos = position?.desktop || 'bottom-right';
        const mobilePos = position?.mobile || 'bottom-right';
        
        const [desktopVPos, desktopHPos] = desktopPos.split('-');
        const [mobileVPos, mobileHPos] = mobilePos.split('-');
        
        // Chat box appears with proper spacing from button position for desktop
        const desktopChatBoxPosition = desktopVPos === 'bottom' ? 'bottom: 80px' : 'top: 80px';
        const desktopChatBoxAlignment = `${desktopHPos}: 30px`;
        
        const mobileChatBoxPosition = mobileVPos === 'bottom' ? 'bottom: 30px' : 'top: 30px';
        
        return {
            desktop: `${desktopChatBoxPosition} !important; ${desktopChatBoxAlignment} !important;`,
            mobile: `${mobileChatBoxPosition} !important;`
        };
    }
}
// Initialize the widget
function initChatWidget(customConfig = {}) {
  const scriptTag = document.getElementById('Agent-Bubble-Widget');
  const agentId = scriptTag?.getAttribute('agent-id');
  const lang = scriptTag?.getAttribute('lang') || 'fr';
  
  const position = {
    desktop: scriptTag?.getAttribute('bubble-position-desktop') || 'bottom-right',
    mobile: scriptTag?.getAttribute('bubble-position-mobile') || 'bottom-right'
  };
  
  const buttonSizeDesktop = {
    height: scriptTag?.getAttribute('bubble-button-desktop-height') || '60px'
  };
  const buttonSizeMobile = {
    height: scriptTag?.getAttribute('bubble-button-mobile-height') || '60px'
  };
  
  const spacingDesktop = {
    top: scriptTag?.getAttribute('bubble-spacing-desktop-top') || '20px',
    right: scriptTag?.getAttribute('bubble-spacing-desktop-right') || '20px',
    bottom: scriptTag?.getAttribute('bubble-spacing-desktop-bottom') || '20px',
    left: scriptTag?.getAttribute('bubble-spacing-desktop-left') || '20px'
  };
  const spacingMobile = {
    top: scriptTag?.getAttribute('bubble-spacing-mobile-top') || '20px',
    right: scriptTag?.getAttribute('bubble-spacing-mobile-right') || '20px',
    bottom: scriptTag?.getAttribute('bubble-spacing-mobile-bottom') || '20px',
    left: scriptTag?.getAttribute('bubble-spacing-mobile-left') || '20px'
  };
  
  const config = {
    position,
    buttonSize: {
      desktop: buttonSizeDesktop,
      mobile: buttonSizeMobile
    },
    spacing: {
      desktop: spacingDesktop,
      mobile: spacingMobile
    },
    ...customConfig
  };
  
  if (agentId) {
    new ChatWidget(agentId, lang, config);
  } else {
    console.error("Agent ID is missing in the script tag.");
  }
}
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initChatWidget, 0);
} else {
  document.addEventListener('DOMContentLoaded', initChatWidget);
}