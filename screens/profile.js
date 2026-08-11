import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useRef, useMemo } from 'react';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import SuccessModal from '../components/modals/successModal';
import ConfirmModal from '../components/modals/confirmModal';
import ErrorModal from '../components/modals/errorModal';
import InfoModal from '../components/modals/infoModal';
import LoadingModal from '../components/modals/loadingModal';
import { useContext } from 'react';
import { StyleSheet } from 'react-native';
import ThemeModal from '../components/modals/themeModal';
import { ThemeContext } from '../context/themeContext';
import Settings from './screens/settings';

export default function ProfileScreen() {
  const { theme, themeName, changeTheme } = useContext(ThemeContext);
  const BACKUP_DIR = FileSystem.documentDirectory + 'Backups/';
  const [showThemeModal, setShowThemeModal] = useState(false);

  const [errorVisible, setErrorVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const [stats, setStats] = useState({
    scanned: 0,
    bought: 0,
    calories: 0,
    favourites: 0,
    recents: 0,
    avg: 0,
  });

  const updateProfileStats = async () => {
    const stored = JSON.parse(await AsyncStorage.getItem('ProfileStats')) || {
      scanned: 0,
      bought: 0,
      calories: 0,
    };

    stored.scanned += 1;

    await AsyncStorage.setItem('ProfileStats', JSON.stringify(stored));
  };

  const [backupInfo, setBackupInfo] = useState({
    time: null,
    size: null,
  });

  const ensureBackupFolder = async () => {
    const info = await FileSystem.getInfoAsync(BACKUP_DIR);

    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(BACKUP_DIR, {
        intermediates: true,
      });
    }
  };
  const loadStats = async () => {
    const backup = JSON.parse(await AsyncStorage.getItem('LastBackup')) || {};

    setBackupInfo({
      time: backup.time || null,
      size: backup.size || 0,
    });

    const profile = JSON.parse(await AsyncStorage.getItem('ProfileStats')) || {
      scanned: 0,
      bought: 0,
      calories: 0,
    };

    const fav = JSON.parse(await AsyncStorage.getItem('Favourites')) || [];

    const avg =
      profile.bought > 0 ? Math.round(profile.calories / profile.bought) : 0;

    setStats({
      scanned: profile.scanned,

      bought: profile.bought,

      calories: profile.calories,

      favourites: fav.length,

      avg,
    });
  };

  const backupSheetRef = useRef(null);

  const snapPoints = useMemo(() => ['42%'], []);

  const openBackup = () => {
    backupSheetRef.current?.expand();
  };

  const closeBackup = () => {
    backupSheetRef.current?.close();
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, []),
  );

  const resetEverything = async () => {
    await AsyncStorage.multiRemove([
      'ToBuy',
      'ToBuyRecents',
      'Favourites',
      'ProfileStats',
    ]);

    loadStats();
  };

  const importBackup = async () => {
    try {
      setLoadingVisible(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setLoadingVisible(false);
        return;
      }

      const file = result.assets[0];

      const json = await FileSystem.readAsStringAsync(file.uri);

      const backup = JSON.parse(json);

      if (backup.version !== 1) {
        throw new Error('Unsupported backup version');
      }

      if (!backup.data) {
        throw new Error('Invalid backup file.');
      }

      await AsyncStorage.multiSet([
        ['ToBuy', JSON.stringify(backup.data.ToBuy || [])],
        ['ToBuyRecents', JSON.stringify(backup.data.ToBuyRecents || [])],
        ['Favourites', JSON.stringify(backup.data.Favourites || [])],
        ['ProfileStats', JSON.stringify(backup.data.ProfileStats || {})],
      ]);

      await AsyncStorage.setItem(
        'LastBackup',
        JSON.stringify({
          time: new Date().toISOString(),
          size: (json.length / 1024).toFixed(1),
        }),
      );

      loadStats();
      setSuccessVisible(true);

      setLoadingVisible(false);
      setSuccessVisible(true);
    } catch (err) {
      setErrorTitle('Import Failed');
      setErrorMessage('The selected file is not a valid NutriScan backup.');
      setErrorVisible(true);
    }
  };

  const createBackup = async () => {
    try {
      const backup = {
        app: 'NutriScan',
        version: 1,
        createdAt: new Date().toISOString(),

        data: {
          ToBuy: JSON.parse(await AsyncStorage.getItem('ToBuy')) || [],
          ToBuyRecents:
            JSON.parse(await AsyncStorage.getItem('ToBuyRecents')) || [],
          Favourites:
            JSON.parse(await AsyncStorage.getItem('Favourites')) || [],
          ProfileStats:
            JSON.parse(await AsyncStorage.getItem('ProfileStats')) || {},
        },
      };

      const json = JSON.stringify(backup, null, 2);

      const filename = `NutriScan_Backup_${Date.now()}.json`;

      const uri = FileSystem.cacheDirectory + filename;

      await FileSystem.writeAsStringAsync(uri, json);

      // Opens the system share/save sheet
      await Sharing.shareAsync(uri, {
        mimeType: 'application/json',
        dialogTitle: 'Save NutriScan Backup',
        UTI: 'public.json',
      });

      await AsyncStorage.setItem(
        'LastBackup',
        JSON.stringify({
          time: new Date().toISOString(),
          size: (json.length / 1024).toFixed(1),
          filename,
        }),
      );

      await loadStats();

      setSuccessMessage('Backup exported successfully.');
      setShowSuccessModal(true);
    } catch (e) {
      console.log(e);

      setErrorTitle('Backup Failed');
      setErrorMessage('Unable to create backup.');
      setShowError(true);
    }
  };

  const ActionCard = ({ icon, title, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: theme.card,
        borderRadius: 22,
        padding: 20,
        height: 120,
        justifyContent: 'center',
        alignContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 30,
          textAlign: 'center',
          borderColor: 'white',
          color: theme.text,
          padding: 5,
        }}
      >
        {icon}
      </Text>

      <View style={{}}>
        <Text
          style={{
            color: theme.text,
            fontSize: 20,
            fontWeight: '600',
            textAlign: 'center',
          }}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const StatCard = ({ title, value }) => (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.card,
        padding: 18,
        borderRadius: 20,
      }}
    >
      <Text
        style={{
          color: theme.text,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 30,
          fontWeight: 'bold',
          marginTop: 5,
        }}
      >
        {value}
      </Text>
    </View>
  );

  const Option = ({ icon, title, color }) => (
    <TouchableOpacity
      style={{
        backgroundColor: theme.card,
        padding: 20,
        borderRadius: 22,
        marginBottom: 12,

        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 16,
        }}
      >
        {icon} {title}
      </Text>

      <Text
        style={{
          color: color || theme.textSecondary,
        }}
      >
        →
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
    >
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: theme.background,
          marginBottom: 100,
        }}
        contentContainerStyle={{
          padding: 18,
        }}
      >
        {/* HEADER */}

        <View
          style={{
            alignItems: 'center',
            marginTop: 40,
            marginBottom: 30,
          }}
        >
          <View
            style={{
              width: 90,
              height: 90,

              borderRadius: 45,

              backgroundColor: theme.secondary,

              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 34,
              }}
            >
              👤
            </Text>
          </View>

          <Text
            style={{
              color: theme.text,
              fontSize: 28,
              fontWeight: 'bold',
              marginTop: 15,
            }}
          >
            Grocery Profile
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
            }}
          >
            Organise • Scan • Track
          </Text>
        </View>

        {/* STATS */}

        <View
          style={{
            flexDirection: 'row',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <StatCard title="Scanned" value={stats.scanned} />

          <StatCard title="Bought" value={stats.bought} />
        </View>

        <View
          style={{
            flexDirection: 'row',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <StatCard title="Calories" value={stats.calories} />

          <StatCard title="Favourites" value={stats.favourites} />
        </View>

        <View
          style={{
            backgroundColor: theme.card,
            padding: 22,
            borderRadius: 24,
            marginBottom: 14,
          }}
        >
          <Text
            style={{
              color: theme.secondary,
              fontSize: 20,
              fontWeight: 'bold',
            }}
          >
            THIS WEEK
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              marginTop: 10,
            }}
          >
            Scanned {stats.scanned}
            {'\n'}
            Bought {stats.bought}
            {'\n'}
            Calories {stats.calories}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: theme.card,
            padding: 22,
            borderRadius: 24,
            marginBottom: 14,
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontSize: 18,
              fontWeight: 'bold',
            }}
          >
            🏆 Product Collection
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              marginTop: 10,
            }}
          >
            {stats.scanned}/100 Products
          </Text>

          <View
            style={{
              height: 12,
              backgroundColor: theme.progressTrack,
              borderRadius: 20,
              marginTop: 10,
            }}
          >
            <View
              style={{
                height: 12,
                width: `${Math.min(100, stats.scanned)}%`,
                backgroundColor: theme.progressFill,
                borderRadius: 20,
              }}
            />
          </View>
        </View>

        <View
          style={{
            backgroundColor: theme.card,
            padding: 22,
            borderRadius: 24,
            marginBottom: 14,
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontWeight: 'bold',
              fontSize: 18,
            }}
          >
            📈 Analytics
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              marginTop: 12,
            }}
          >
            Average kcal/item
            {'\n'}
            🔥 {stats.avg}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: theme.card,
            padding: 22,
            borderRadius: 24,
            marginBottom: 18,
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontSize: 18,
              fontWeight: 'bold',
            }}
          >
            🧠 Grocery Personality
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              marginTop: 12,
            }}
          >
            {stats.avg > 350
              ? '🍔 Big Energy'
              : stats.avg > 200
                ? '⚡ Balanced'
                : '🥦 Healthy'}
          </Text>
        </View>

        {/* OPTIONS */}
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            marginBottom: 10,
            gap: 10,
          }}
        >
          <ActionCard
            icon="🎨"
            title="Theme"
            onPress={() => setShowThemeModal(true)}
          />

          <ActionCard icon="☁" title="Backup Data" onPress={openBackup} />
        </View>

        <View
          style={{
            flex: 1,
            flexDirection: 'row',

            gap: 10,
          }}
        >
          <ActionCard
            icon="⚙"
            title="Settings"
            onPress={() => navigation.navigate('Settings')}
          />

          <ActionCard
            icon="ℹ"
            title="About"
            onPress={() => setShowAbout(true)}
          />
        </View>

        <TouchableOpacity
          onPress={() => setShowResetModal(true)}
          style={{
            backgroundColor: theme.buttonDanger,
            padding: 20,
            borderRadius: 22,
            marginTop: 10,
          }}
        >
          <Text
            style={{
              color: theme.buttonDangerText,
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            🗑 Reset App Data
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomSheet
        ref={backupSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{
          backgroundColor: theme.card,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        }}
        handleIndicatorStyle={{
          backgroundColor: theme.textSecondary,
          width: 60,
        }}
      >
        <BottomSheetView
          style={{
            flex: 1,
            padding: 25,
            paddingBottom: 100,
            backgroundColor: theme.card,
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontSize: 26,
              fontWeight: 'bold',
            }}
          >
            ☁ Backup Data
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              marginTop: 8,
              marginBottom: 25,
            }}
          >
            Keep your grocery data safe.
          </Text>

          <TouchableOpacity
            onPress={createBackup}
            style={{
              backgroundColor: theme.buttonSecondary,
              padding: 18,
              borderRadius: 18,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                color: theme.text,
                fontSize: 18,
              }}
            >
              ⬆ Export Backup
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowImportConfirm(true)}
            style={{
              backgroundColor: theme.buttonSecondary,
              padding: 18,
              borderRadius: 18,
              marginBottom: 25,
            }}
          >
            <Text
              style={{
                color: theme.text,
                fontSize: 18,
              }}
            >
              ⬇ Import Backup
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              color: theme.textSecondary,
            }}
          >
            Last Backup
          </Text>

          <Text
            style={{
              color: theme.text,
              marginBottom: 15,
            }}
          >
            {backupInfo.time
              ? new Date(backupInfo.time).toLocaleString()
              : 'Never'}
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
            }}
          >
            Backup Size
          </Text>

          <Text
            style={{
              color: theme.text,
            }}
          >
            {backupInfo.size} KB
          </Text>
        </BottomSheetView>
      </BottomSheet>

      <ConfirmModal
        visible={showResetModal}
        icon="🗑"
        title="Reset App Data?"
        message="This will permanently delete all grocery data."
        confirmText="Delete"
        confirmColor={theme.buttonDanger}
        onCancel={() => setShowResetModal(false)}
        onConfirm={() => {
          setShowResetModal(false);
          resetEverything();
        }}
      />

      <SuccessModal
        visible={showSuccessModal}
        title="Backup Created"
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />

      <ErrorModal
        visible={showError}
        title="Backup Failed"
        message="An error occurred while creating your backup."
        onClose={() => setShowError(false)}
      />

      <InfoModal
        visible={showAbout}
        title="About NutriScan"
        version="1.0.0"
        message="NutriScan helps you scan food products, organize groceries, and track nutrition with a clean, modern experience."
        onClose={() => setShowAbout(false)}
      />

      <ConfirmModal
        visible={showImportConfirm}
        icon="⬇️"
        title="Import Backup?"
        message="Importing a backup will replace your current grocery data."
        confirmText="Import"
        confirmColor={theme.button}
        onCancel={() => setShowImportConfirm(false)}
        onConfirm={() => {
          setShowImportConfirm(false);
          importBackup();
        }}
      />

      <LoadingModal
        visible={loadingVisible}
        title="Importing Backup"
        message="Please wait..."
      />

      <SuccessModal
        visible={successVisible}
        title="Backup Imported"
        message="Your grocery data has been restored successfully."
        onClose={() => setSuccessVisible(false)}
      />

      <ErrorModal
        visible={errorVisible}
        title={errorTitle}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />

      <ThemeModal
        visible={showThemeModal}
        currentTheme={themeName}
        onClose={() => setShowThemeModal(false)}
        onSelect={changeTheme}
      />
    </View>
  );
  const styles = StyleSheet.create({
    themeButton: {
      backgroundColor: theme.buttonSecondary,
      padding: 16,
      borderRadius: 16,
      marginTop: 10,
    },

    themeText: {
      color: theme.buttonText,
      fontSize: 18,
      textAlign: 'center',
    },
  });
}
