import React from 'react';
import { motion } from 'framer-motion';
import { FiWifi, FiWifiOff, FiLoader } from 'react-icons/fi';
import { useWebSocketContext } from '../providers/WebSocketProvider';

const WebSocketStatus = () => {
  const { connectionState, isConnected, isConnecting, isFailed } = useWebSocketContext();

  const getStatusConfig = () => {
    switch (connectionState) {
      case 'CONNECTED':
        return {
          icon: FiWifi,
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
          borderColor: 'border-green-400/50',
          text: 'Connected',
          pulse: false
        };
      case 'CONNECTING':
        return {
          icon: FiLoader,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10',
          borderColor: 'border-yellow-400/50',
          text: 'Connecting...',
          pulse: true
        };
      case 'FAILED':
        return {
          icon: FiWifiOff,
          color: 'text-red-400',
          bgColor: 'bg-red-400/10',
          borderColor: 'border-red-400/50',
          text: 'Connection Failed',
          pulse: false
        };
      default:
        return {
          icon: FiWifiOff,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400/50',
          text: 'Disconnected',
          pulse: false
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm ${config.bgColor} ${config.borderColor}`}
    >
      <motion.div
        animate={config.pulse ? { rotate: 360 } : {}}
        transition={config.pulse ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
      >
        <Icon className={`w-4 h-4 ${config.color}`} />
      </motion.div>
      <span className={`text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    </motion.div>
  );
};

export default WebSocketStatus;