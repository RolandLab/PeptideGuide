import SwiftUI

struct PreferencesView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppSpacing.xl) {
                AppHeader(
                    title: "Preferences",
                    subtitle: "Minimal app-level settings for launch and reading behavior."
                )

                VStack(alignment: .leading, spacing: AppSpacing.lg) {
                    preferenceCard(title: "Launch screen") {
                        Menu {
                            ForEach(LaunchScreenOption.allCases) { option in
                                Button(option.title) {
                                    store.preferredLaunchScreen = option
                                }
                            }
                        } label: {
                            HStack {
                                Text(store.preferredLaunchScreen.title)
                                    .foregroundStyle(AppColors.textPrimary)
                                Spacer()
                                Image(systemName: "chevron.up.chevron.down")
                                    .font(.system(size: 11, weight: .semibold))
                                    .foregroundStyle(AppColors.accent)
                            }
                            .padding(.horizontal, AppSpacing.md)
                            .padding(.vertical, AppSpacing.sm)
                            .background(AppColors.secondaryCardBackground)
                            .overlay(
                                RoundedRectangle(cornerRadius: 10, style: .continuous)
                                    .stroke(AppColors.border, lineWidth: 1)
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                        }
                        .buttonStyle(.plain)
                        .frame(maxWidth: 240, alignment: .leading)
                    }

                    preferenceCard(title: "Suggested section") {
                        HStack {
                            Text("Show suggested compounds on Home")
                                .font(AppTypography.body)
                                .foregroundStyle(AppColors.textPrimary)
                            Spacer()
                            Button {
                                store.showSuggestedSection.toggle()
                            } label: {
                                HStack(spacing: 6) {
                                    Text(store.showSuggestedSection ? "On" : "Off")
                                        .font(AppTypography.meta)
                                        .foregroundStyle(store.showSuggestedSection ? .white : AppColors.textSecondary)

                                    Circle()
                                        .fill(store.showSuggestedSection ? Color.white : AppColors.textSecondary.opacity(0.35))
                                        .frame(width: 18, height: 18)
                                }
                                .padding(.horizontal, 10)
                                .padding(.vertical, 8)
                                .frame(width: 72)
                                .background(store.showSuggestedSection ? AppColors.accent : AppColors.controlBackground)
                                .overlay(
                                    Capsule()
                                        .stroke(store.showSuggestedSection ? AppColors.accent : AppColors.border, lineWidth: 1)
                                )
                                .clipShape(Capsule())
                            }
                            .buttonStyle(.plain)
                        }
                    }

                    preferenceCard(title: "Reading density") {
                        HStack(spacing: AppSpacing.xs) {
                            ForEach(ReadingDensity.allCases) { density in
                                Button {
                                    store.readingDensity = density
                                } label: {
                                    Text(density.title)
                                        .font(AppTypography.meta)
                                        .foregroundStyle(store.readingDensity == density ? .white : AppColors.textPrimary)
                                        .padding(.horizontal, AppSpacing.md)
                                        .padding(.vertical, AppSpacing.sm)
                                        .frame(maxWidth: .infinity)
                                        .background(store.readingDensity == density ? AppColors.accent : AppColors.controlBackground)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 10, style: .continuous)
                                                .stroke(store.readingDensity == density ? AppColors.accent : AppColors.border, lineWidth: 1)
                                        )
                                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .frame(maxWidth: 260, alignment: .leading)
                    }

                    Button("Reset preferences", action: store.resetPreferences)
                        .buttonStyle(.plain)
                        .font(AppTypography.meta)
                        .foregroundStyle(AppColors.textPrimary)
                        .padding(.horizontal, AppSpacing.md)
                        .padding(.vertical, AppSpacing.sm)
                        .background(AppColors.secondaryButtonBackground)
                        .overlay(
                            RoundedRectangle(cornerRadius: 10, style: .continuous)
                                .stroke(AppColors.border, lineWidth: 1)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                }
            }
            .padding(AppSpacing.xxl)
            .frame(maxWidth: 760, alignment: .leading)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(AppColors.background)
    }

    @ViewBuilder
    private func preferenceCard<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            Text(title)
                .font(AppTypography.sectionTitle)
                .foregroundStyle(AppColors.textPrimary)
            content()
        }
        .padding(AppSpacing.xl)
        .background(AppColors.cardBackground)
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(AppColors.border, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
    }
}
