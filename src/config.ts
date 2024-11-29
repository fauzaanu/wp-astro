export const siteConfig = {
    name: "The Daily Post",
    description: "Delivering thoughtful insights and compelling stories to our readers every day.",
    defaultLanguage: "en-US",
    dateFormat: {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    } as const,
    navigation: [
        { name: "Home", href: "/" },
        { name: "Categories", href: "/categories" },
        { name: "About", href: "/about" }
    ],
    social: [
        { name: "LinkedIn", icon: "mdi:linkedin", href: "#" },
        { name: "Twitter", icon: "mdi:twitter", href: "#" },
        { name: "Facebook", icon: "mdi:facebook", href: "#" }
    ],
    footer: {
        links: [
            { name: "Privacy Policy", href: "/privacy" },
            { name: "Terms of Service", href: "/terms" }
        ]
    }
} as const;
