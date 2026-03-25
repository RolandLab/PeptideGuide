import AppKit
import Foundation

let arguments = CommandLine.arguments
guard arguments.count > 1 else {
    fputs("Usage: generate_icon.swift <output-directory>\n", stderr)
    exit(1)
}

let outputDirectory = URL(fileURLWithPath: arguments[1], isDirectory: true)
let fileManager = FileManager.default
try fileManager.createDirectory(at: outputDirectory, withIntermediateDirectories: true)

let iconsetDirectory = outputDirectory.appendingPathComponent("PeptideGuideApp.iconset", isDirectory: true)
try? fileManager.removeItem(at: iconsetDirectory)
try fileManager.createDirectory(at: iconsetDirectory, withIntermediateDirectories: true)

let sizes: [(points: CGFloat, scale: CGFloat, name: String)] = [
    (16, 1, "icon_16x16.png"),
    (16, 2, "icon_16x16@2x.png"),
    (32, 1, "icon_32x32.png"),
    (32, 2, "icon_32x32@2x.png"),
    (128, 1, "icon_128x128.png"),
    (128, 2, "icon_128x128@2x.png"),
    (256, 1, "icon_256x256.png"),
    (256, 2, "icon_256x256@2x.png"),
    (512, 1, "icon_512x512.png"),
    (512, 2, "icon_512x512@2x.png"),
]

func drawIcon(pointSize: CGFloat, scale: CGFloat) -> NSImage {
    let pixelSize = NSSize(width: pointSize * scale, height: pointSize * scale)
    let image = NSImage(size: pixelSize)

    image.lockFocus()
    defer { image.unlockFocus() }

    let rect = NSRect(origin: .zero, size: pixelSize)
    NSColor.clear.setFill()
    rect.fill()

    let cornerRadius = pixelSize.width * 0.23
    let shellRect = rect.insetBy(dx: pixelSize.width * 0.04, dy: pixelSize.height * 0.04)
    let shellPath = NSBezierPath(roundedRect: shellRect, xRadius: cornerRadius, yRadius: cornerRadius)

    let baseGradient = NSGradient(colors: [
        NSColor(calibratedRed: 0.10, green: 0.20, blue: 0.22, alpha: 1.0),
        NSColor(calibratedRed: 0.20, green: 0.39, blue: 0.40, alpha: 1.0),
        NSColor(calibratedRed: 0.86, green: 0.87, blue: 0.77, alpha: 1.0),
    ])!
    baseGradient.draw(in: shellPath, angle: -38)

    NSGraphicsContext.current?.saveGraphicsState()
    shellPath.addClip()

    let glowRect = NSRect(
        x: pixelSize.width * 0.52,
        y: pixelSize.height * 0.42,
        width: pixelSize.width * 0.52,
        height: pixelSize.height * 0.52
    )
    let glowPath = NSBezierPath(ovalIn: glowRect)
    NSColor(calibratedRed: 1.0, green: 0.96, blue: 0.85, alpha: 0.38).setFill()
    glowPath.fill()

    let bandRect = NSRect(
        x: pixelSize.width * -0.08,
        y: pixelSize.height * 0.10,
        width: pixelSize.width * 1.18,
        height: pixelSize.height * 0.30
    )
    let bandPath = NSBezierPath(roundedRect: bandRect, xRadius: pixelSize.width * 0.16, yRadius: pixelSize.width * 0.16)
    NSColor(calibratedRed: 0.94, green: 0.92, blue: 0.84, alpha: 0.22).setFill()
    let transform = NSAffineTransform()
    transform.translateX(by: pixelSize.width * 0.06, yBy: pixelSize.height * 0.06)
    transform.rotate(byDegrees: -24)
    transform.concat()
    bandPath.fill()
    NSGraphicsContext.current?.restoreGraphicsState()

    let ringRect = shellRect.insetBy(dx: pixelSize.width * 0.20, dy: pixelSize.height * 0.20)
    let ringPath = NSBezierPath(ovalIn: ringRect)
    ringPath.lineWidth = pixelSize.width * 0.065
    NSColor(calibratedRed: 0.96, green: 0.96, blue: 0.91, alpha: 0.95).setStroke()
    ringPath.stroke()

    let moleculeColor = NSColor(calibratedRed: 0.93, green: 0.95, blue: 0.94, alpha: 0.95)
    let connector = NSBezierPath()
    connector.lineWidth = pixelSize.width * 0.04
    connector.lineCapStyle = .round

    let nodes = [
        CGPoint(x: pixelSize.width * 0.37, y: pixelSize.height * 0.60),
        CGPoint(x: pixelSize.width * 0.50, y: pixelSize.height * 0.68),
        CGPoint(x: pixelSize.width * 0.64, y: pixelSize.height * 0.57),
        CGPoint(x: pixelSize.width * 0.48, y: pixelSize.height * 0.40),
    ]

    connector.move(to: nodes[0])
    connector.line(to: nodes[1])
    connector.line(to: nodes[2])
    connector.move(to: nodes[1])
    connector.line(to: nodes[3])
    connector.move(to: nodes[0])
    connector.line(to: nodes[3])
    moleculeColor.setStroke()
    connector.stroke()

    for (index, node) in nodes.enumerated() {
        let diameter = pixelSize.width * (index == 1 ? 0.11 : 0.085)
        let nodeRect = NSRect(x: node.x - diameter / 2, y: node.y - diameter / 2, width: diameter, height: diameter)
        let nodePath = NSBezierPath(ovalIn: nodeRect)
        if index == 1 {
            NSColor(calibratedRed: 0.98, green: 0.84, blue: 0.58, alpha: 1.0).setFill()
        } else {
            moleculeColor.setFill()
        }
        nodePath.fill()
    }

    let plaqueRect = NSRect(
        x: pixelSize.width * 0.22,
        y: pixelSize.height * 0.16,
        width: pixelSize.width * 0.56,
        height: pixelSize.height * 0.16
    )
    let plaquePath = NSBezierPath(roundedRect: plaqueRect, xRadius: pixelSize.width * 0.05, yRadius: pixelSize.width * 0.05)
    NSColor(calibratedWhite: 1.0, alpha: 0.16).setFill()
    plaquePath.fill()

    let paragraph = NSMutableParagraphStyle()
    paragraph.alignment = .center
    let fontSize = pixelSize.width * 0.12
    let attributes: [NSAttributedString.Key: Any] = [
        .font: NSFont.systemFont(ofSize: fontSize, weight: .semibold),
        .foregroundColor: NSColor(calibratedWhite: 0.98, alpha: 0.92),
        .paragraphStyle: paragraph,
    ]
    let text = NSString(string: "PG")
    text.draw(in: plaqueRect.offsetBy(dx: 0, dy: pixelSize.height * 0.01), withAttributes: attributes)

    let rimPath = NSBezierPath(roundedRect: shellRect, xRadius: cornerRadius, yRadius: cornerRadius)
    rimPath.lineWidth = pixelSize.width * 0.012
    NSColor(calibratedWhite: 1.0, alpha: 0.24).setStroke()
    rimPath.stroke()

    return image
}

for size in sizes {
    let image = drawIcon(pointSize: size.points, scale: size.scale)
    guard
        let tiff = image.tiffRepresentation,
        let bitmap = NSBitmapImageRep(data: tiff),
        let png = bitmap.representation(using: .png, properties: [:])
    else {
        fputs("Failed to create PNG for \(size.name)\n", stderr)
        exit(1)
    }

    let fileURL = iconsetDirectory.appendingPathComponent(size.name)
    try png.write(to: fileURL)
}

print(iconsetDirectory.path)
