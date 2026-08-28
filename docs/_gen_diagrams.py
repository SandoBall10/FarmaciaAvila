"""Genera docs/architecture.png y docs/database.png a partir del modelo real del repo."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUT = Path(__file__).resolve().parent
NAVY = (15, 39, 68)
NAVY2 = (27, 58, 97)
TEAL = (14, 116, 144)
GREEN = (22, 101, 52)
AMBER = (146, 64, 14)
SLATE = (51, 65, 85)
LINE = (100, 116, 139)
BG = (248, 250, 252)
WHITE = (255, 255, 255)
SOFT = (226, 232, 240)
ACCENT = (37, 99, 235)


def font(size, bold=False):
    names = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
    ]
    for n in names:
        try:
            return ImageFont.truetype(n, size)
        except OSError:
            continue
    return ImageFont.load_default()


F_TITLE = font(28, True)
F_H = font(15, True)
F_B = font(13, True)
F_S = font(12)
F_XS = font(11)


def rounded(draw, xy, r, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=r, fill=fill, outline=outline, width=width)


def center_text(draw, xy, text, fnt, fill=WHITE):
    x1, y1, x2, y2 = xy
    bbox = draw.textbbox((0, 0), text, font=fnt)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((x1 + x2 - tw) / 2, (y1 + y2 - th) / 2 - 1), text, font=fnt, fill=fill)


def arrow(draw, x1, y1, x2, y2, color=LINE):
    draw.line((x1, y1, x2, y2), fill=color, width=2)
    # simple chevron
    if abs(x2 - x1) >= abs(y2 - y1):
        s = 7 if x2 > x1 else -7
        draw.polygon([(x2, y2), (x2 - s, y2 - 5), (x2 - s, y2 + 5)], fill=color)
    else:
        s = 7 if y2 > y1 else -7
        draw.polygon([(x2, y2), (x2 - 5, y2 - s), (x2 + 5, y2 - s)], fill=color)


def dashed(draw, x1, y1, x2, y2, color=LINE, dash=8):
    dx, dy = x2 - x1, y2 - y1
    dist = max((dx * dx + dy * dy) ** 0.5, 1)
    n = int(dist / dash)
    for i in range(0, n, 2):
        t0, t1 = i / n, min((i + 1) / n, 1)
        draw.line((x1 + dx * t0, y1 + dy * t0, x1 + dx * t1, y1 + dy * t1), fill=color, width=2)


def architecture():
    w, h = 1800, 1100
    img = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(img)

    d.text((48, 28), "Farmacia Ávila — Arquitectura", font=F_TITLE, fill=NAVY)
    d.text(
        (48, 68),
        "Docker Compose  ·  red interna farmacia  ·  volumen farmacia_pgdata",
        font=F_S,
        fill=SLATE,
    )

    # Browser
    rounded(d, (48, 130, 280, 250), 14, NAVY)
    center_text(d, (48, 150, 280, 200), "Navegador", F_H)
    center_text(d, (48, 190, 280, 240), "SPA + REST", F_S)

    # Compose envelope
    rounded(d, (340, 110, 1752, 1040), 20, (241, 245, 249), NAVY2, 2)
    d.text((360, 124), "Docker Compose", font=F_H, fill=NAVY2)

    # Frontend
    rounded(d, (380, 180, 760, 430), 14, WHITE, TEAL, 2)
    d.rectangle((380, 180, 760, 228), fill=TEAL)
    center_text(d, (380, 180, 760, 228), "Frontend  :8080", F_H)
    d.text((400, 250), "React 18 + TypeScript", font=F_B, fill=SLATE)
    d.text((400, 278), "Build Vite  ·  Axios", font=F_S, fill=SLATE)
    d.text((400, 304), "Nginx unprivileged", font=F_S, fill=SLATE)
    d.text((400, 330), "SPA try_files → index.html", font=F_S, fill=SLATE)
    d.text((400, 368), "VITE_API_URL (build time)", font=F_XS, fill=TEAL)
    d.text((400, 390), "http://localhost:8010", font=F_XS, fill=TEAL)

    # Backend
    rounded(d, (820, 180, 1320, 620), 14, WHITE, ACCENT, 2)
    d.rectangle((820, 180, 1320, 228), fill=ACCENT)
    center_text(d, (820, 180, 1320, 228), "Backend Spring Boot  :8010", F_H)
    layers = [
        (250, "REST  ·  POST /authenticate  ·  /api/**"),
        (290, "Spring Security  ·  JWT HS256  ·  BCrypt"),
        (330, "Controllers → Services → Repositories"),
        (370, "JPA / Hibernate  (ddl-auto=validate)"),
        (410, "Flyway  V1__initial_schema.sql"),
        (450, "Perfil prod  ·  secretos por variables"),
        (490, "Usuario no-root (spring)"),
        (530, "CORS configurable  ·  denyAll por defecto"),
    ]
    for y, t in layers:
        rounded(d, (840, y, 1300, y + 32), 8, (239, 246, 255), ACCENT)
        d.text((854, y + 6), t, font=F_XS, fill=NAVY)

    # Seed
    rounded(d, (380, 470, 760, 620), 14, WHITE, AMBER, 2)
    d.rectangle((380, 470, 760, 512), fill=AMBER)
    center_text(d, (380, 470, 760, 512), "Seed (one-shot)", F_H)
    d.text((400, 530), "docker/seed-demo.sql", font=F_S, fill=SLATE)
    d.text((400, 556), "Usuarios demo si no existen", font=F_S, fill=SLATE)
    d.text((400, 582), "Espera tabla users (Flyway)", font=F_XS, fill=AMBER)

    # Postgres
    rounded(d, (1360, 180, 1710, 430), 14, WHITE, GREEN, 2)
    d.rectangle((1360, 180, 1710, 228), fill=GREEN)
    center_text(d, (1360, 180, 1710, 228), "PostgreSQL 16", F_H)
    d.text((1380, 255), "Solo red interna", font=F_B, fill=SLATE)
    d.text((1380, 283), "No publicado al host", font=F_S, fill=SLATE)
    d.text((1380, 311), "5432 interno", font=F_S, fill=SLATE)
    d.text((1380, 351), "Volumen: farmacia_pgdata", font=F_S, fill=GREEN)
    d.text((1380, 385), "Healthcheck pg_isready", font=F_XS, fill=SLATE)

    # Arrows
    arrow(d, 280, 170, 380, 205, TEAL)
    d.text((250, 140), "UI :8080", font=F_XS, fill=TEAL)
    arrow(d, 280, 210, 820, 250, ACCENT)
    d.text((500, 145), "REST + Bearer JWT  →  :8010", font=F_XS, fill=ACCENT)
    arrow(d, 1320, 300, 1360, 300, GREEN)
    d.text((1324, 270), "JDBC", font=F_XS, fill=GREEN)
    arrow(d, 1320, 360, 1360, 360, GREEN)
    d.text((1288, 368), "Flyway", font=F_XS, fill=GREEN)
    arrow(d, 760, 545, 1360, 360, AMBER)
    d.text((980, 500), "INSERT demo →", font=F_XS, fill=AMBER)

    # Note
    rounded(d, (820, 660, 1710, 1000), 14, WHITE, SOFT, 1)
    d.text((840, 680), "Flujo de una petición autenticada", font=F_H, fill=NAVY)
    steps = [
        "1. El navegador carga la SPA en http://localhost:8080 (Nginx).",
        "2. El JS llama al backend en http://localhost:8010 (no usa el hostname Docker backend).",
        "3. /authenticate es público. El resto de /api/** exige JWT válido.",
        "4. SecurityFilterChain: permitAll authenticate/error · authenticated /api/** · denyAll el resto.",
        "5. Controller → Service → Repository/JPA. Ventas: transacción + PESSIMISTIC_WRITE en stock.",
        "6. PostgreSQL persiste datos. Flyway valida el esquema (versión 1).",
    ]
    y = 720
    for s in steps:
        d.text((840, y), s, font=F_S, fill=SLATE)
        y += 36

    img.save(OUT / "architecture.png", "PNG", optimize=True)
    print("wrote architecture.png")


def table(d, x, y, w, title, cols, header_fill):
    row_h = 22
    h = 36 + row_h * len(cols) + 8
    rounded(d, (x, y, x + w, y + h), 10, WHITE, header_fill, 2)
    d.rectangle((x, y, x + w, y + 32), fill=header_fill)
    center_text(d, (x, y, x + w, y + 32), title, F_B)
    cy = y + 40
    for c in cols:
        d.text((x + 12, cy), c, font=F_XS, fill=SLATE)
        cy += row_h
    return h


def database():
    w, h = 1800, 1180
    img = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(img)
    d.text((48, 24), "Farmacia Ávila — Modelo de datos", font=F_TITLE, fill=NAVY)
    d.text(
        (48, 64),
        "Fuente: V1__initial_schema.sql  ·  Las únicas FK declaradas están en users_roles.",
        font=F_S,
        fill=SLATE,
    )

    h1 = table(
        d, 60, 120, 320, "roles",
        ["PK  id  BIGINT", "UK  name  VARCHAR(255) NOT NULL"],
        NAVY2,
    )
    h2 = table(
        d, 460, 120, 380, "users",
        [
            "PK  id  BIGINT",
            "UK  username  VARCHAR(255)",
            "    password  VARCHAR(255)",
            "    nombre / apellido  VARCHAR(50)",
            "    email  VARCHAR(50)",
        ],
        NAVY2,
    )
    h3 = table(
        d, 260, 360, 360, "users_roles",
        [
            "PK  (user_id, role_id)",
            "FK  user_id → users.id",
            "FK  role_id → roles.id",
        ],
        TEAL,
    )

    # FK arrows
    arrow(d, 220, 120 + h1, 260, 360, TEAL)
    arrow(d, 650, 120 + h2, 500, 360, TEAL)
    d.text((200, 330), "N:M", font=F_XS, fill=TEAL)

    table(
        d, 60, 560, 400, "producto",
        [
            "PK  id  INTEGER",
            "    nombre  VARCHAR(50)",
            "    precio  DOUBLE PRECISION",
            "    cantidad  INTEGER  (stock)",
            "    fecha_vencimiento  DATE",
            "    descripcion  VARCHAR(200)",
            "    categoria  VARCHAR(255)",
        ],
        GREEN,
    )
    table(
        d, 500, 560, 380, "cliente",
        [
            "PK  id  INTEGER",
            "    nombre  VARCHAR(80)",
            "    apellidos  VARCHAR(80)",
            "    email  VARCHAR(255)",
            "    telefono  VARCHAR(255)",
        ],
        GREEN,
    )
    table(
        d, 940, 560, 380, "venta",
        [
            "PK  id  INTEGER",
            "    idcliente  INTEGER  NOT NULL",
            "    fecha_registro  DATE",
            "    precio_total  DOUBLE PRECISION",
            "    (sin FK a cliente en V1)",
        ],
        ACCENT,
    )
    table(
        d, 1360, 560, 390, "venta_detalle",
        [
            "PK  id  INTEGER",
            "    idventa  INTEGER  NOT NULL",
            "    idproducto  INTEGER  NOT NULL",
            "    cantidad  INTEGER",
            "    precio_unitario  DOUBLE",
            "    (nullable; sin FK en V1)",
        ],
        ACCENT,
    )

    dashed(d, 690, 720, 940, 620, AMBER)
    dashed(d, 1130, 720, 1360, 620, AMBER)
    dashed(d, 260, 760, 1360, 700, AMBER)
    d.text((700, 690), "referencia lógica", font=F_XS, fill=AMBER)
    d.text((700, 706), "(entero, sin FK)", font=F_XS, fill=AMBER)

    rounded(d, (60, 920, 1740, 1130), 12, WHITE, SOFT, 1)
    d.text((80, 940), "Notas del esquema real", font=F_H, fill=NAVY)
    notes = [
        "V1 no declara claves foráneas entre venta, cliente, producto ni venta_detalle. Esas asociaciones se guardan como enteros (idcliente, idventa, idproducto).",
        "La relación users ↔ roles sí está normalizada: tabla puente users_roles con FK a users e id y roles.id.",
        "JPA usa @ManyToMany en User/Role sobre users_roles. Venta y VentaDetalle no usan @ManyToOne.",
        "precio_unitario es nullable. La aplicación, al registrar una venta, copia el precio vigente del producto.",
        "El stock se descuenta en Producto.cantidad dentro de una transacción, con bloqueo PESSIMISTIC_WRITE.",
    ]
    y = 978
    for n in notes:
        d.text((80, y), "•  " + n, font=F_S, fill=SLATE)
        y += 28

    img.save(OUT / "database.png", "PNG", optimize=True)
    print("wrote database.png")


if __name__ == "__main__":
    architecture()
    database()
