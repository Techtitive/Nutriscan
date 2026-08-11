import { View, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useContext, useState } from 'react';
import { ThemeContext } from '../context/themeContext';

export default function Settings() {
  const { theme } = useContext(ThemeContext);

  const [notifications, setNotifications] = useState(true);

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 40,
      }}
    >
      {/* Notifications */}
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 18,
          padding: 18,
          marginBottom: 18,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.text,
                fontSize: 18,
                fontWeight: '700',
              }}
            >
              Notifications
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                marginTop: 4,
              }}
            >
              Receive reminders and important updates.
            </Text>
          </View>

          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{
              false: theme.border,
              true: theme.primary,
            }}
            thumbColor={notifications ? theme.buttonText : theme.textSecondary}
          />
        </View>
      </View>

      {/* Future Settings */}
      <TouchableOpacity
        style={{
          backgroundColor: theme.card,
          padding: 18,
          borderRadius: 18,
          marginBottom: 14,
        }}
      >
        <Text
          style={{
            color: theme.text,
            fontSize: 17,
            fontWeight: '600',
          }}
        >
          Privacy
        </Text>

        <Text
          style={{
            color: theme.textSecondary,
            marginTop: 4,
          }}
        >
          Manage privacy preferences.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: theme.card,
          padding: 18,
          borderRadius: 18,
          marginBottom: 14,
        }}
      >
        <Text
          style={{
            color: theme.text,
            fontSize: 17,
            fontWeight: '600',
          }}
        >
          Data & Storage
        </Text>

        <Text
          style={{
            color: theme.textSecondary,
            marginTop: 4,
          }}
        >
          Manage downloaded and cached data.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: theme.card,
          padding: 18,
          borderRadius: 18,
        }}
      >
        <Text
          style={{
            color: theme.error,
            fontSize: 17,
            fontWeight: '700',
          }}
        >
          Reset App
        </Text>

        <Text
          style={{
            color: theme.textSecondary,
            marginTop: 4,
          }}
        >
          Restore all settings to default.
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
