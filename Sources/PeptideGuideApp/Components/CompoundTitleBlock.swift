import SwiftUI

struct CompoundTitleBlock: View {
    let compound: Compound

    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.md) {
            Text(compound.name)
                .font(AppTypography.hero)
                .foregroundStyle(AppColors.textPrimary)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: AppSpacing.xs) {
                    ForEach(compound.categories) { category in
                        TagChip(label: category.title)
                    }
                    ForEach(compound.tags, id: \.self) { tag in
                        TagChip(label: tag)
                    }
                }
            }
        }
    }
}
