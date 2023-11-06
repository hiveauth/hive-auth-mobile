export default {
	menu: {
		accounts: "Accounts",
		about: "About",
		lock: "Lock application",
		logs: "Logs",
	},
	logs: {
	  success_copy_clipboard: "Data copied to clipboard",
	  error_copy_clipboard: "Failed to copy data to clipboard",
	},
	scan: {
	  error_scan: "QR scan failed",
	  error_permission_denied: "Camera Permissions denied",
	  error_start_scan: "Permissions denied or Error when getting camera permissions",
	},
	login: {
	  pin_label: "PIN code",
	  pin_placeholder: "Enter your six digit PIN code",
	  pin_repeat_label: "Confirm PIN code",
	  pin_repeat_placeholder: "Confirm your six digit PIN code",
	  btn_save: "Set PIN code",
	  biometrics_unavailable: "Device Biometrics not available. Please enable them and restart the app.",
	  failed: "Authentication failed",
	  pin_init: 'PIN code initialized',
	  pin_error: 'Error setting PIN code',
	},
	store_auth: {
	  biometrics_reason: "Allow HiveAuth to use your biometrics to Authenticate",
	  biometrics_title: "Authenticate",
	  biometrics_subtitle: "", //"Unlock HiveAuth with your Biometrics",
	  biometrics_description: "Provide your FaceID or Touch ID to unlock HiveAuth",
	},
  accounts: {
    empty: 'No Accounts found',
    empty_sessions: 'No sessions found',
    keys: 'Keys',
    sessions: 'Sessions',
    expires: 'Expires',
    delete_key_dialog_title: '',
    delete_key_delete_button: '',
    delete_key_cancel_button: '',
  },
	accounts_key: {
		confirm_delete_key: {
			title: "Delete Key",
			message:"Are you sure you want to delete this key?"
		},
		confirm_delete_account: {
			title: "Account deletion",
			message: "Deleting that key will also delete the account. Do you want to continue?",
		},
    deleted: 'Key has been deleted',
	},
	sessions: {
		empty: "No sessions found",
		valid: "Valid till",
	},
	dialog_auth_req: {
		text: "wants to authenticate on",
		timeout: "Session validity",
	},
	dialog_challenge_req: {
		text: "wants to validate a challenge on",
	},
	dialog_sign_req: {
		text: "wants to sign a transaction on",
		whitelist: "Do not prompt again for",
	},
	import_key: {
		title: 'Import your existing Hive account',
		success: 'Key is securely stored',
		failed: 'Failed to validate key',
		no_match: 'No matching key',
		invalid: 'Invalid {type} Key',
		username: {
			label: "Username",
			placeholder: "Enter your Hive username",
		},
		key: {
			label: "Private {type} Key",
			placeholder: "Enter or scan your private key",
		}
	},
	main_page: {
		no_pending_request: 'No pending request',
	},
	main_layout: {
		registered: ' registered',
	},
	btn_ok: "OK",
	btn_cancel: "Cancel",
	btn_add: "Add",
	btn_save: "Save",
	btn_update: "Update",
	btn_approve: "Approve",
	btn_reject: "Reject",

	not_supported: "Feature not supported yet"
}