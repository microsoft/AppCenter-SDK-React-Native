// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Alert, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Crashes, { UserConfirmation } from 'appcenter-crashes';

import AppCenterScreen from './screens/AppCenterScreen';
import TransmissionScreen from './screens/TransmissionScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import CrashesScreen from './screens/CrashesScreen';
import AttachmentsProvider from './AttachmentsProvider';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBarOptions={{
          activeBackgroundColor: 'white',
          inactiveBackgroundColor: 'white',
        }}
      >
        <Tab.Screen name="AppCenter" component={AppCenterScreen} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} />
        <Tab.Screen name="Transmission" component={TransmissionScreen} />
        <Tab.Screen name="Crashes" component={CrashesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;

Crashes.setListener({
  shouldProcess(report) {
    console.log(`Should process report with id: ${report.id}'`);
    return true;
  },

  shouldAwaitUserConfirmation() {
    console.log('Should await user confirmation');
    Alert.alert(
      'One or more crashes were detected, do you want to report them?',
      null,
      [
        { text: 'Yes, and ask me again if it occurs again.', onPress: () => Crashes.notifyUserConfirmation(UserConfirmation.SEND) },
        { text: 'Yes, always send them', onPress: () => Crashes.notifyUserConfirmation(UserConfirmation.ALWAYS_SEND) },
        { text: 'Don\'t send at this time', onPress: () => Crashes.notifyUserConfirmation(UserConfirmation.DONT_SEND) },
      ]
    );
    return true;
  },

  getErrorAttachments(report) {
    console.log(`Get error attachments for report with id: ${report.id}'`);
    return AttachmentsProvider.getErrorAttachments();
  },

  onBeforeSending() {
    console.log('Will send crash. onBeforeSending is invoked.');
  },

  onSendingSucceeded() {
    console.log('Did send crash. onSendingSucceeded is invoked.');
  },

  onSendingFailed() {
    console.log('Failed sending crash. onSendingFailed is invoked.');
  }
});
