import SwiftUI

struct TagChip: View {
    let label: String
    var isSelected = false
    var action: (() -> Void)?

    var body: some View {
        Group {
            if let action {
                Button(action: action) {
                    chipContent
                }
                .buttonStyle(.plain)
            } else {
                chipContent
            }
        }
    }

    private var chipContent: some View {
        Text(label)
            .font(AppTypography.meta)
            .foregroundStyle(isSelected ? Color.white : AppColors.textSecondary)
            .padding(.horizontal, AppSpacing.sm)
            .padding(.vertical, AppSpacing.xs)
            .background(isSelected ? AppColors.accent : AppColors.tagBackground)
            .clipShape(Capsule())
    }
}
