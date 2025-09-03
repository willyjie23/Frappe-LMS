<template>
	<div class="flex flex-col justify-between h-full">
		<div>
			<div class="flex items-center justify-between">
				<div class="text-xl font-semibold leading-none mb-1 text-ink-gray-9">
					{{ __(label) }}
				</div>
				<Badge
					v-if="hasUnsavedChanges"
					:label="__('Not Saved')"
					variant="subtle"
					theme="orange"
				/>
			</div>
			<div class="text-xs text-ink-gray-5 mb-6">
				{{ __(description) }}
			</div>
			
			<div class="space-y-4">
				<div class="flex flex-col space-y-2">
					<label class="text-sm font-medium text-ink-gray-8">
						{{ __('Select Language') }}
					</label>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
						<div
							v-for="language in availableLanguages"
							:key="language.code"
							class="relative"
						>
							<input
								:id="language.code"
								v-model="selectedLanguage"
								:value="language.code"
								type="radio"
								name="language"
								class="sr-only"
							/>
							<label
								:for="language.code"
								class="flex items-center p-3 border border-surface-gray-3 rounded-lg cursor-pointer transition-all duration-200 hover:border-surface-gray-4 hover:bg-surface-gray-1"
								:class="{
									'border-primary-500 bg-primary-50': selectedLanguage === language.code,
									'border-surface-gray-3': selectedLanguage !== language.code
								}"
							>
								<div class="flex items-center space-x-3">
									<div class="flex-shrink-0">
										<div
											class="w-4 h-4 rounded-full border-2 flex items-center justify-center"
											:class="{
												'border-primary-500 bg-primary-500': selectedLanguage === language.code,
												'border-surface-gray-4': selectedLanguage !== language.code
											}"
										>
											<div
												v-if="selectedLanguage === language.code"
												class="w-2 h-2 rounded-full bg-white"
											></div>
										</div>
									</div>
									<div class="flex flex-col">
										<span class="text-sm font-medium text-ink-gray-9">
											{{ language.name }}
										</span>
										<span class="text-xs text-ink-gray-6">
											{{ language.nativeName }}
										</span>
									</div>
								</div>
							</label>
						</div>
					</div>
				</div>

				<div v-if="selectedLanguage !== currentLanguage" class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
					<div class="flex">
						<div class="flex-shrink-0">
							<svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
							</svg>
						</div>
						<div class="ml-3">
							<p class="text-sm text-yellow-800">
								{{ __('Language changes will take effect after saving and the page will be refreshed.') }}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="flex flex-row-reverse mt-auto">
			<Button 
				variant="solid" 
				:loading="saving" 
				:disabled="selectedLanguage === currentLanguage"
				@click="saveLanguagePreference"
			>
				{{ __('Save Language') }}
			</Button>
		</div>
	</div>
</template>

<script setup>
import { Button, Badge, toast, createResource } from 'frappe-ui'
import { ref, computed, onMounted } from 'vue'
import { usersStore } from '@/stores/user'

const props = defineProps({
	label: {
		type: String,
		required: true,
	},
	description: {
		type: String,
	},
})

const { userResource } = usersStore()
const selectedLanguage = ref('zh_Hant')
const currentLanguage = ref('zh_Hant')
const saving = ref(false)

// Available languages with their display names
const availableLanguages = [
	{ code: 'en', name: 'English', nativeName: 'English' },
	{ code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文' },
	{ code: 'zh_Hant', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
	{ code: 'ar', name: 'Arabic', nativeName: 'العربية' },
	{ code: 'bs', name: 'Bosnian', nativeName: 'Bosanski' },
	{ code: 'cs', name: 'Czech', nativeName: 'Čeština' },
	{ code: 'da', name: 'Danish', nativeName: 'Dansk' },
	{ code: 'de', name: 'German', nativeName: 'Deutsch' },
	{ code: 'es', name: 'Spanish', nativeName: 'Español' },
	{ code: 'fa', name: 'Persian', nativeName: 'فارسی' },
	{ code: 'fr', name: 'French', nativeName: 'Français' },
	{ code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
	{ code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
	{ code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
	{ code: 'it', name: 'Italian', nativeName: 'Italiano' },
	{ code: 'nb', name: 'Norwegian Bokmål', nativeName: 'Norsk bokmål' },
	{ code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
	{ code: 'pl', name: 'Polish', nativeName: 'Polski' },
	{ code: 'pt', name: 'Portuguese', nativeName: 'Português' },
	{ code: 'pt_BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
	{ code: 'ru', name: 'Russian', nativeName: 'Русский' },
	{ code: 'sr', name: 'Serbian', nativeName: 'Српски' },
	{ code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
	{ code: 'th', name: 'Thai', nativeName: 'ไทย' },
	{ code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
	{ code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
]

const hasUnsavedChanges = computed(() => {
	return selectedLanguage.value !== currentLanguage.value
})

// Resource to get current user language preference
const userLanguageResource = createResource({
	url: 'frappe.client.get_value',
	onSuccess(data) {
		const userLang = data?.language || 'zh_Hant'
		selectedLanguage.value = userLang
		currentLanguage.value = userLang
	}
})

// Resource to save language preference
const saveLanguageResource = createResource({
	url: 'frappe.client.set_value',
	onSuccess() {
		saving.value = false
		currentLanguage.value = selectedLanguage.value
		
		// Show success message
		toast.success(__('Language preference saved successfully'))
		
		// Reload translations and refresh the page
		refreshTranslations()
	},
	onError(error) {
		saving.value = false
		toast.error(error.messages?.[0] || __('Failed to save language preference'))
	}
})

const saveLanguagePreference = () => {
	if (!userResource.data?.name) {
		toast.error(__('User not found'))
		return
	}
	
	saving.value = true
	saveLanguageResource.submit({
		doctype: 'User',
		name: userResource.data.name,
		fieldname: 'language',
		value: selectedLanguage.value
	})
}

const refreshTranslations = () => {
	// Clear existing translations cache
	if (window.translatedMessages) {
		delete window.translatedMessages
	}
	
	// Set language parameter and reload page to fetch new translations
	const urlParams = new URLSearchParams(window.location.search)
	if (selectedLanguage.value !== 'zh_Hant') {
		urlParams.set('lang', selectedLanguage.value)
	} else {
		urlParams.delete('lang')
	}
	
	// Update URL and reload page
	const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '')
	window.location.href = newUrl
}

onMounted(() => {
	// Load user language preference when component mounts
	if (userResource.data?.name) {
		userLanguageResource.fetch({
			doctype: 'User',
			fieldname: 'language',
			filters: { name: userResource.data.name }
		})
	} else {
		// Watch for user data to be loaded
		const unwatch = userResource.$subscribe(() => {
			if (userResource.data?.name) {
				userLanguageResource.fetch({
					doctype: 'User',
					fieldname: 'language',
					filters: { name: userResource.data.name }
				})
				unwatch()
			}
		})
	}
})
</script>