import os
import json

def clean_file(filepath):
    with open(filepath, 'r') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            return False

    modified = False

    if "ConnectionStrings" in data:
        for k in data["ConnectionStrings"]:
            if "Supabase" in data["ConnectionStrings"][k] or "aws-0" in data["ConnectionStrings"][k]:
                data["ConnectionStrings"][k] = ""
                modified = True

    if "Cloudinary" in data:
        data["Cloudinary"]["CloudName"] = ""
        data["Cloudinary"]["ApiKey"] = ""
        data["Cloudinary"]["ApiSecret"] = ""
        modified = True

    if "Jwt" in data:
        if "Issuer" in data["Jwt"]: data["Jwt"]["Issuer"] = ""
        if "Audience" in data["Jwt"]: data["Jwt"]["Audience"] = ""
        if "SecretKey" in data["Jwt"]: data["Jwt"]["SecretKey"] = ""
        modified = True

    if "Payments" in data:
        if "Paystack" in data["Payments"] and "SecretKey" in data["Payments"]["Paystack"]:
            data["Payments"]["Paystack"]["SecretKey"] = ""
            modified = True
        if "Flutterwave" in data["Payments"] and "SecretKey" in data["Payments"]["Flutterwave"]:
            data["Payments"]["Flutterwave"]["SecretKey"] = ""
            modified = True

    if "Seed" in data and "SuperAdmin" in data["Seed"]:
        if "Email" in data["Seed"]["SuperAdmin"]:
            data["Seed"]["SuperAdmin"]["Email"] = "admin@example.com"
        if "Password" in data["Seed"]["SuperAdmin"]:
            data["Seed"]["SuperAdmin"]["Password"] = ""
        modified = True

    if modified:
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Cleaned {filepath}")
    return modified

for root, dirs, files in os.walk('LandlordTenantPlatform'):
    for file in files:
        if file.startswith('appsettings') and file.endswith('.json'):
            if "bin" not in root and "obj" not in root:
                clean_file(os.path.join(root, file))

