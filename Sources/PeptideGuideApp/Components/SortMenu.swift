import SwiftUI

struct SortMenu: View {
    @Binding var selection: CompoundSortOption

    var body: some View {
        HStack(spacing: AppSpacing.sm) {
            Text("Sort")
                .font(AppTypography.meta)
                .foregroundStyle(AppColors.textSecondary)

            Menu {
                ForEach(CompoundSortOption.allCases) { option in
                    Button(option.title) {
                        selection = option
                    }
                }
            } label: {
                HStack(spacing: AppSpacing.xs) {
                    Text(selection.title)
                        .font(AppTypography.body)
                        .foregroundStyle(AppColors.textPrimary)
                    Image(systemName: "chevron.up.chevron.down")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(AppColors.accent)
                }
                .padding(.horizontal, AppSpacing.md)
                .padding(.vertical, AppSpacing.sm)
                .background(AppColors.controlBackground)
                .overlay(
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .stroke(AppColors.border, lineWidth: 1)
                )
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            }
        }
        .frame(maxWidth: .infinity, alignment: .trailing)
    }
}
