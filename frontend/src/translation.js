import { createResource } from 'frappe-ui'

export default function translationPlugin(app) {
	app.config.globalProperties.__ = translate
	window.__ = translate
	if (!window.translatedMessages) fetchTranslations()
}

function translate(message) {
	let translatedMessages = window.translatedMessages || {}
	let translatedMessage = translatedMessages[message] || message

	const hasPlaceholders = /{\d+}/.test(message)
	if (!hasPlaceholders) {
		return translatedMessage
	}
	return {
		format: function (...args) {
			return translatedMessage.replace(
				/{(\d+)}/g,
				function (match, number) {
					return typeof args[number] != 'undefined'
						? args[number]
						: match
				}
			)
		},
	}
}

function fetchTranslations(lang) {
	// Get language from URL parameter, user preference, or default to Traditional Chinese
	const urlParams = new URLSearchParams(window.location.search)
	const requestedLang = lang || urlParams.get('lang') || getCurrentUserLanguage() || 'zh_Hant'
	
	createResource({
		url: 'lms.lms.api.get_translations',
		params: { lang: requestedLang },
		cache: `translations_${requestedLang}`,
		auto: true,
		transform: (data) => {
			window.translatedMessages = data
			window.currentLanguage = requestedLang
		},
	})
}

function getCurrentUserLanguage() {
	// Try to get language from cookie or localStorage
	try {
		const storedLang = localStorage.getItem('user_language')
		if (storedLang) {
			return storedLang
		}
	} catch (e) {
		// Fallback if localStorage is not available
	}
	// Always default to Traditional Chinese
	return 'zh_Hant'
}

// Function to reload translations with a specific language
function reloadTranslations(lang) {
	// Clear existing translations
	if (window.translatedMessages) {
		delete window.translatedMessages
	}
	
	// Store language preference
	try {
		localStorage.setItem('user_language', lang)
	} catch (e) {
		// Fallback if localStorage is not available
	}
	
	// Fetch new translations
	fetchTranslations(lang)
}

// Export the reload function for use in components
window.reloadTranslations = reloadTranslations
