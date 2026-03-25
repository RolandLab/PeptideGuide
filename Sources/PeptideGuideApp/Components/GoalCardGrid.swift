import SwiftUI

struct GoalCardGrid: View {
    let categories: [CompoundCategory]
    let action: (CompoundCategory) -> Void

    private let columns = [
        GridItem(.adaptive(minimum: 220, maximum: 320), spacing: AppSpacing.lg),
    ]

    var body: some View {
        LazyVGrid(columns: columns, spacing: AppSpacing.lg) {
            ForEach(categories) { category in
                GoalCard(
                    title: category.title,
                    subtitle: category.subtitle,
                    icon: category.icon
                ) {
                    action(category)
                }
            }
        }
    }
}
