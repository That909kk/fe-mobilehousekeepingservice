import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { useStaticData } from '../../hooks/useStaticData';
import { COLORS, UI } from '../../constants';

const { width } = Dimensions.get('window');

export const DashboardScreen: React.FC = () => {
  const { user, role, logout, loading } = useAuth();
  const { data: staticData } = useStaticData('dashboard');

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: () => logout()
        },
      ]
    );
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.fullName || user.username || 'User';
  };

  if (!staticData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={COLORS.gradient.primary as [string, string]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>
                Chào mừng, {getUserDisplayName()}!
              </Text>
              <Text style={styles.roleText}>
                {role === 'CUSTOMER' ? '👤 Khách hàng' : 
                 role === 'EMPLOYEE' ? '🧹 Nhân viên' : '⚙️ Quản trị viên'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color={COLORS.surface} />
            </TouchableOpacity>
          </View>

          {/* Stats Overview */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="calendar-outline" size={24} color={COLORS.surface} />
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Đặt lịch</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.surface} />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Hoàn thành</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="star" size={24} color={COLORS.surface} />
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>Đánh giá</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Housekeeping Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏠 Dịch vụ Giúp việc</Text>
          <View style={styles.servicesGrid}>
            <TouchableOpacity style={styles.serviceCard}>
              <LinearGradient
                colors={['#E8F5E8', '#C8E6C9']}
                style={styles.serviceCardGradient}
              >
                <Ionicons name="home" size={32} color={COLORS.primary} />
                <Text style={styles.serviceTitle}>Dọn dẹp nhà</Text>
                <Text style={styles.serviceDescription}>Vệ sinh tổng quát</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceCard}>
              <LinearGradient
                colors={['#E3F2FD', '#BBDEFB']}
                style={styles.serviceCardGradient}
              >
                <Ionicons name="shirt" size={32} color={COLORS.secondary} />
                <Text style={styles.serviceTitle}>Giặt ủi</Text>
                <Text style={styles.serviceDescription}>Giặt ủi quần áo</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceCard}>
              <LinearGradient
                colors={['#FFF3E0', '#FFE0B2']}
                style={styles.serviceCardGradient}
              >
                <Ionicons name="restaurant" size={32} color={COLORS.accent} />
                <Text style={styles.serviceTitle}>Nấu ăn</Text>
                <Text style={styles.serviceDescription}>Chuẩn bị bữa ăn</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceCard}>
              <LinearGradient
                colors={['#F3E5F5', '#E1BEE7']}
                style={styles.serviceCardGradient}
              >
                <Ionicons name="flower" size={32} color="#9C27B0" />
                <Text style={styles.serviceTitle}>Chăm sóc vườn</Text>
                <Text style={styles.serviceDescription}>Tưới cây, tỉa cành</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Thao tác nhanh</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="add-circle" size={20} color={COLORS.surface} />
              <Text style={styles.quickActionText}>Đặt dịch vụ</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="time" size={20} color={COLORS.surface} />
              <Text style={styles.quickActionText}>Lịch sử</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="chatbubbles" size={20} color={COLORS.surface} />
              <Text style={styles.quickActionText}>Hỗ trợ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Hoạt động gần đây</Text>
          
          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Dọn dẹp nhà hoàn thành</Text>
              <Text style={styles.activitySubtitle}>Hôm qua - 2 giờ</Text>
              <Text style={styles.activityDescription}>Đánh giá: ⭐⭐⭐⭐⭐</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Ionicons name="time" size={24} color={COLORS.warning} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Lịch hẹn sắp tới</Text>
              <Text style={styles.activitySubtitle}>Ngày mai - 9:00 AM</Text>
              <Text style={styles.activityDescription}>Giặt ủi quần áo</Text>
            </View>
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={[styles.section, styles.emergencySection]}>
          <View style={styles.emergencyCard}>
            <Ionicons name="call" size={24} color={COLORS.error} />
            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyTitle}>Hỗ trợ khẩn cấp</Text>
              <Text style={styles.emergencySubtitle}>Hotline: 1900-xxxx</Text>
            </View>
            <TouchableOpacity style={styles.emergencyButton}>
              <Text style={styles.emergencyButtonText}>Gọi ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: UI.SCREEN_PADDING,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 16,
    color: COLORS.surface,
    opacity: 0.9,
  },
  logoutButton: {
    padding: 8,
    borderRadius: UI.BORDER_RADIUS.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: UI.BORDER_RADIUS.medium,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.surface,
    opacity: 0.9,
    marginTop: 4,
  },
  section: {
    padding: UI.SCREEN_PADDING,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: (width - 48) / 2 - 8,
    marginBottom: 16,
  },
  serviceCardGradient: {
    padding: 16,
    borderRadius: UI.BORDER_RADIUS.large,
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 8,
    textAlign: 'center',
  },
  serviceDescription: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: UI.BORDER_RADIUS.medium,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  quickActionText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  activityCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: UI.BORDER_RADIUS.medium,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 1,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityIcon: {
    marginRight: 12,
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  emergencySection: {
    paddingBottom: 40,
  },
  emergencyCard: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: UI.BORDER_RADIUS.medium,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  emergencyContent: {
    flex: 1,
    marginLeft: 12,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  emergencySubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  emergencyButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: UI.BORDER_RADIUS.medium,
  },
  emergencyButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});
