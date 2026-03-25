import SwiftUI

struct DetailActionBar: View {
    let isSaved: Bool
    let onSave: () -> Void
    let onCompare: () -> Void
    let onShare: () -> Void

    var body: some View {
        HStack(spacing: AppSpacing.sm) {
            actionButton(
                title: isSaved ? "Saved" : "Save",
                background: AppColors.accent,
                border: AppColors.accent,
                foreground: .white,
                action: onSave
            )

            actionButton(
                title: "Add to Compare",
                background: AppColors.secondaryButtonBackground,
                border: AppColors.border,
                foreground: AppColors.textPrimary,
                action: onCompare
            )

            actionButton(
                title: "Share",
                background: AppColors.controlBackground,
                border: AppColors.border,
                foreground: AppColors.textPrimary,
                action: onShare
            )
        }
    }

    private func actionButton(
        title: String,
        background: Color,
        border: Color,
        foreground: Color,
        action: @escaping () -> Void
    ) -> some View {
        Button(title, action: action)
            .buttonStyle(.plain)
            .font(AppTypography.meta)
            .foregroundStyle(foreground)
            .padding(.horizontal, AppSpacing.md)
            .padding(.vertical, AppSpacing.xs)
            .background(background)
            .overlay(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .stroke(border, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
    }
}
