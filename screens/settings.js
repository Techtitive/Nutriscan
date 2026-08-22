import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useContext } from 'react';
import { ThemeContext } from '../context/themeContext';
import { useSettings } from '../context/settingsContext';

export default function Settings() {
  const { settings, updateSetting, resetSettings } = useSettings();
  const { theme } = useContext(ThemeContext);

  const SettingRow = ({
    icon,
    title,
    description,
    right,
    onPress,
    danger = false,
  }) => {
    return (
      <TouchableOpacity
        activeOpacity={onPress ? 0.7 : 1}
        onPress={onPress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 16,
        }}
      >
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: danger ? `${theme.error}20` : `${theme.primary}18`,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
          }}
        >
          <Ionicons
            name={icon}
            size={21}
            color={danger ? theme.error : theme.primary}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: danger ? theme.error : theme.text,
              fontSize: 16,
              fontWeight: '600',
            }}
          >
            {title}
          </Text>

          {description && (
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 13,
                marginTop: 3,
                lineHeight: 18,
              }}
            >
              {description}
            </Text>
          )}
        </View>

        {right}

        {!right && onPress && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.textSecondary}
          />
        )}
      </TouchableOpacity>
    );
  };

  const Section = ({ title, children }) => {
    return (
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 13,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            marginBottom: 8,
            marginLeft: 5,
          }}
        >
          {title}
        </Text>

        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 18,
            paddingHorizontal: 16,
          }}
        >
          {children}
        </View>
      </View>
    );
  };

  const Divider = () => (
    <View
      style={{
        height: 1,
        backgroundColor: theme.border,
        opacity: 0.5,
      }}
    />
  );

  const Toggle = ({ value, setting }) => (
    <Switch
      value={value}
      onValueChange={(newValue) => updateSetting(setting, newValue)}
      trackColor={{
        false: theme.border,
        true: theme.primary,
      }}
      thumbColor={value ? theme.buttonText : theme.textSecondary}
    />
  );

  const resetAppSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to restore all settings to their defaults?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetSettings,
        },
      ],
    );
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 50,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ marginBottom: 25 }}>
        <Text
          style={{
            color: theme.text,
            fontSize: 30,
            fontWeight: '800',
          }}
        >
          Settings
        </Text>

        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 14,
            marginTop: 5,
          }}
        >
          Customize your NutriScan experience.
        </Text>
      </View>

      {/* Notifications */}
      <Section title="Notifications">
        <SettingRow
          icon="notifications-outline"
          title="Notifications"
          description="Receive important NutriScan notifications."
          right={
            <Toggle value={settings.notifications} setting="notifications" />
          }
        />

        <Divider />

        <SettingRow
          icon="pricetag-outline"
          title="Price Alerts"
          description="Get notified when product prices change."
          right={<Toggle value={settings.priceAlerts} setting="priceAlerts" />}
        />

        <Divider />

        <SettingRow
          icon="cart-outline"
          title="Product Reminders"
          description="Receive reminders about products on your list."
          right={
            <Toggle
              value={settings.productReminders}
              setting="productReminders"
            />
          }
        />
      </Section>

      {/* Scanner */}
      <Section title="Scanner">
        <SettingRow
          icon="phone-portrait-outline"
          title="Vibrate on Scan"
          description="Vibrate when a barcode is detected."
          right={
            <Toggle value={settings.vibrateOnScan} setting="vibrateOnScan" />
          }
        />

        <Divider />

        <SettingRow
          icon="volume-high-outline"
          title="Scan Sound"
          description="Play a sound when a barcode is detected."
          right={<Toggle value={settings.scanSound} setting="scanSound" />}
        />

        <Divider />

        <SettingRow
          icon="scan-outline"
          title="Auto-open Scanner"
          description="Open the scanner automatically when appropriate."
          right={
            <Toggle
              value={settings.autoOpenScanner}
              setting="autoOpenScanner"
            />
          }
        />

        <Divider />

        <SettingRow
          icon="flashlight-outline"
          title="Scanner Flash"
          description="Use the camera flash when scanning."
          right={
            <Toggle value={settings.scannerFlash} setting="scannerFlash" />
          }
        />
      </Section>

      {/* Shopping */}
      <Section title="Shopping">
        <SettingRow
          icon="cart-outline"
          title="Link Scans to To-Buy"
          description="Allow scanned products to be added to your shopping list."
          right={<Toggle value={settings.linkToBuy} setting="linkToBuy" />}
        />

        <Divider />

        <SettingRow
          icon="checkmark-circle-outline"
          title="Show Completed Items"
          description="Keep completed shopping items visible."
          right={
            <Toggle
              value={settings.showCompletedItems}
              setting="showCompletedItems"
            />
          }
        />

        <Divider />

        <SettingRow
          icon="swap-vertical-outline"
          title="Sort To-Buy"
          description={
            settings.sortToBuy === 'date'
              ? 'Newest items first.'
              : 'Products sorted by name.'
          }
          onPress={() => {
            const next = settings.sortToBuy === 'date' ? 'name' : 'date';

            updateSetting('sortToBuy', next);
          }}
        />
      </Section>

      {/* Favourites */}
      <Section title="Favourites">
        <SettingRow
          icon="heart-outline"
          title="Sort Favourites"
          description={
            settings.sortFavourites === 'recent'
              ? 'Recently added first.'
              : 'Products sorted by name.'
          }
          onPress={() => {
            const next =
              settings.sortFavourites === 'recent' ? 'name' : 'recent';

            updateSetting('sortFavourites', next);
          }}
        />
      </Section>

      {/* Recents */}
      <Section title="Recents">
        <SettingRow
          icon="time-outline"
          title="Automatically Remove Old Recents"
          description="Automatically remove older scanned products."
          right={
            <Toggle
              value={settings.autoRemoveOldRecents}
              setting="autoRemoveOldRecents"
            />
          }
        />

        <Divider />

        <SettingRow
          icon="list-outline"
          title="Recent Product Limit"
          description={`${settings.recentLimit} products`}
          onPress={() => {
            const limits = [10, 25, 50, 100];

            const currentIndex = limits.indexOf(settings.recentLimit);

            const nextIndex = (currentIndex + 1) % limits.length;

            updateSetting('recentLimit', limits[nextIndex]);
          }}
        />
      </Section>

      {/* Nutrition */}
      <Section title="Nutrition">
        <SettingRow
          icon="flask-outline"
          title="Energy Unit"
          description={settings.energyUnit}
          onPress={() => {
            updateSetting(
              'energyUnit',
              settings.energyUnit === 'kcal' ? 'kJ' : 'kcal',
            );
          }}
        />

        <Divider />

        <SettingRow
          icon="nutrition-outline"
          title="Nutrition Display"
          description={
            settings.nutritionDisplay === '100g' ? 'Per 100 g' : 'Per serving'
          }
          onPress={() => {
            updateSetting(
              'nutritionDisplay',
              settings.nutritionDisplay === '100g' ? 'serving' : '100g',
            );
          }}
        />

        <Divider />

        <SettingRow
          icon="warning-outline"
          title="Health Warnings"
          description="Show health-related warnings on products."
          right={
            <Toggle
              value={settings.showHealthWarnings}
              setting="showHealthWarnings"
            />
          }
        />
      </Section>

      {/* Privacy */}
      <Section title="Privacy">
        <SettingRow
          icon="time-outline"
          title="Save Scan History"
          description="Keep your recently scanned products."
          right={
            <Toggle
              value={settings.scanHistory ?? true}
              setting="scanHistory"
            />
          }
        />
      </Section>

      {/* Danger Zone */}
      <Section title="Danger Zone">
        <SettingRow
          icon="warning-outline"
          title="Reset Settings"
          description="Restore all settings to their default values."
          danger
          onPress={resetAppSettings}
        />
      </Section>

      {/* Footer */}
      <View
        style={{
          alignItems: 'center',
          marginTop: 5,
        }}
      >
        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 12,
          }}
        >
          NutriScan
        </Text>

        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 11,
            marginTop: 3,
          }}
        >
          Settings
        </Text>
      </View>
    </ScrollView>
  );
}
