﻿using System;
using System.Threading.Tasks;
using Microsoft.Azure.Mobile.Push.Shared.Ingestion.Models;
using Microsoft.Azure.Mobile.Utils.Synchronization;
using Windows.Networking.PushNotifications;

namespace Microsoft.Azure.Mobile.Push
{
    public partial class Push : MobileCenterService
    {
        private void InstanceRegister()
        {
            if (!Enabled)
            {
                MobileCenterLog.Warn(MobileCenterLog.LogTag, "Push service is not enabled.");
            }

            _stateKeeper.InvalidateState();
            var stateSnapshot = _stateKeeper.GetStateSnapshot();
            _mutex.Unlock();

            PushNotificationChannel pushNotificationChannel = Task.Run(() => CreatePushNotificationChannel()).Result;

            try
            {
                _mutex.Lock(stateSnapshot);
            }
            catch (StatefulMutexException e)
            {
                MobileCenterLog.Warn(MobileCenterLog.LogTag, "The Register operation has been cancelled", e);
                return;
            }
            finally
            {
                _mutex.Unlock();
            }

            string pushToken = pushNotificationChannel.Uri;

            if (!string.IsNullOrEmpty(pushToken))
            {
                MobileCenterLog.Debug(MobileCenterLog.LogTag, $"Push token '{pushToken}'");

                PushInstallationLog pushInstallationLog = new PushInstallationLog(0, null, pushToken, Guid.NewGuid());

                Channel.Enqueue(pushInstallationLog);
            }
            else
            {
                MobileCenterLog.Error(LogTag, "PushToken cannot be null or empty.");
            }

            _mutex.Unlock();
        }

        private async Task<PushNotificationChannel> CreatePushNotificationChannel()
        {
            PushNotificationChannel channel = await PushNotificationChannelManager.CreatePushNotificationChannelForApplicationAsync();

            return channel;
        }
    }
}
