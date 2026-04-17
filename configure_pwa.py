import os
import re

def configure_pwa():
    # 1. Load the .env file
    env_vars = {}
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    env_vars[key] = value

    # 2. Map of keys to look for in .env and replace in the SW file
    mapping = {
        'apiKey': env_vars.get('NEXT_PUBLIC_FIREBASE_API_KEY', ''),
        'authDomain': env_vars.get('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', ''),
        'projectId': env_vars.get('NEXT_PUBLIC_FIREBASE_PROJECT_ID', ''),
        'storageBucket': env_vars.get('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', ''),
        'messagingSenderId': env_vars.get('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', ''),
        'appId': env_vars.get('NEXT_PUBLIC_FIREBASE_APP_ID', ''),
        'measurementId': env_vars.get('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID', '')
    }

    sw_path = 'client/public/firebase-messaging-sw.js'
    
    if not os.path.exists(sw_path):
        print(f"Error: Could not find {sw_path}")
        return

    with open(sw_path, 'r') as f:
        content = f.read()

    # 3. Perform the injection using regex
    for key, val in mapping.items():
        # This regex looks for: key: "anything", or key: "", and replaces it with the new value
        pattern = rf'{key}:\s*["\'].*?["\']'
        replacement = f'{key}: "{val}"'
        content = re.sub(pattern, replacement, content)

    # 4. Save the updated file
    with open(sw_path, 'w') as f:
        f.write(content)
    
    print(f"Successfully configured {sw_path} with your .env credentials!")

if __name__ == "__main__":
    configure_pwa()
