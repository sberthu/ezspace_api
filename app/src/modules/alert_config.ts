export const AlertConfig = {
    'bl_tx_alert_type_maladie': {
        "managers": [
            "bl_role_medical",
            "bl_role_work"
        ],
        "members":[]
    },
    'bl_tx_alert_type_blessure': {
        "managers": [
            "bl_role_work",
            "bl_role_medical",
            "bl_role_security",
        ],
        "members": [
            "bl_role_medical",
            "bl_role_security"
        ]
    },
    'bl_tx_alert_type_accident': {
        "managers": [
            "bl_role_work",
            "bl_role_medical",
            "bl_role_security",
        ],
        "members": [
            "bl_role_medical",
            "bl_role_security"
        ]
    },
    'bl_tx_alert_type_covid': {
        "managers": [
            "manager",
            "bl_role_work",
            "bl_role_medical",
            "bl_role_security",
        ],
        "members": [
            "bl_role_medical",
            "bl_role_security"
        ]

    },
    'bl_tx_alert_type_bagarre': {
        "managers": [
            "bl_role_work",
            "bl_role_medical",
            "bl_role_security",
        ],
        "members": [
            "bl_role_medical",
            "bl_role_security"
        ]        
    },
    'bl_tx_alert_type_danger': {
        "managers": [
            "manager",
            "bl_role_work",
            "bl_role_medical",
            "bl_role_security",
        ],
        "members": [
            "bl_role_medical",
            "bl_role_security"
        ]        
    },
    'bl_tx_alert_type_terrorisme': {
        "managers": [
            "bl_role_work",
            "bl_role_medical",
            "bl_role_security",
        ],
        "members": [
            "bl_role_medical",
            "bl_role_security"
        ]     
    },
}