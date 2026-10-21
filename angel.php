<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#f6f7f3" />
    <title>Angel — Gestión de tienda</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f6f7f3;
        --surface: #fff;
        --ink: #20271f;
        --muted: #7b8379;
        --green: #315d45;
        --green-dark: #254a36;
        --lime: #d9ee91;
        --line: #e8ebe5;
        --red: #b84242;
        --shadow: 0 16px 50px rgba(37, 55, 40, 0.07);
      }

      * {
        box-sizing: border-box;
      }

      body {
        min-width: 320px;
        min-height: 100vh;
        margin: 0;
        background: var(--bg);
        color: var(--ink);
        font-family: "Segoe UI", Arial, sans-serif;
      }

      button,
      input {
        font: inherit;
      }

      button {
        cursor: pointer;
      }

      .layout {
        display: grid;
        min-height: 100vh;
        grid-template-columns: 245px minmax(0, 1fr);
      }

      .sidebar {
        display: flex;
        flex-direction: column;
        padding: 30px 20px;
        background: var(--green-dark);
        color: white;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0 0 54px 8px;
        font-size: 1.25rem;
        font-weight: 750;
        letter-spacing: -0.04em;
      }

      .brand-mark {
        display: grid;
        width: 36px;
        height: 36px;
        place-items: center;
        border-radius: 12px;
        background: var(--lime);
        color: var(--green-dark);
        font-size: 1.1rem;
      }

      .nav-label {
        margin: 0 0 12px 12px;
        color: rgba(255, 255, 255, 0.54);
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.13em;
        text-transform: uppercase;
      }

      .nav-item {
        display: flex;
        min-height: 46px;
        align-items: center;
        gap: 12px;
        padding: 0 12px;
        border-radius: 10px;
        color: rgba(255, 255, 255, 0.75);
        font-size: 0.9rem;
        text-decoration: none;
      }

      .nav-item.active {
        background: rgba(255, 255, 255, 0.12);
        color: white;
      }

      .nav-icon {
        width: 20px;
        text-align: center;
      }

      .sidebar-note {
        margin-top: auto;
        padding: 16px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 14px;
        color: rgba(255, 255, 255, 0.72);
        font-size: 0.78rem;
        line-height: 1.6;
      }

      .sidebar-note strong {
        display: block;
        margin-bottom: 5px;
        color: white;
        font-size: 0.85rem;
      }

      .main {
        min-width: 0;
        padding: 0 42px 42px;
      }

      .topbar {
        display: flex;
        min-height: 82px;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--line);
      }

      .breadcrumb {
        color: var(--muted);
        font-size: 0.82rem;
      }

      .breadcrumb strong {
        color: var(--ink);
        font-weight: 650;
      }

      .user-chip {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.83rem;
        font-weight: 650;
      }

      .avatar {
        display: grid;
        width: 34px;
        height: 34px;
        place-items: center;
        border-radius: 50%;
        background: #e4eadf;
        color: var(--green);
        font-size: 0.8rem;
      }

      .content {
        width: min(100%, 1300px);
        margin: 0 auto;
      }

      .heading {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 20px;
        margin: 36px 0 26px;
      }

      .eyebrow {
        margin: 0 0 8px;
        color: var(--green);
        font-size: 0.72rem;
        font-weight: 750;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0;
        font-size: clamp(1.8rem, 3vw, 2.35rem);
        letter-spacing: -0.055em;
      }

      .subtitle {
        margin: 8px 0 0;
        color: var(--muted);
        font-size: 0.9rem;
      }

      .primary-button {
        display: inline-flex;
        min-height: 44px;
        flex: 0 0 auto;
        align-items: center;
        justify-content: center;
        gap: 9px;
        padding: 0 17px;
        border: 0;
        border-radius: 10px;
        background: var(--green);
        color: white;
        font-size: 0.87rem;
        font-weight: 650;
        transition: background 160ms ease, transform 160ms ease;
      }

      .primary-button:hover {
        transform: translateY(-1px);
        background: var(--green-dark);
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      .stat-card {
        display: flex;
        min-height: 112px;
        align-items: center;
        gap: 15px;
        padding: 20px;
        border: 1px solid var(--line);
        border-radius: 14px;
        background: var(--surface);
        box-shadow: var(--shadow);
      }

      .stat-icon {
        display: grid;
        width: 44px;
        height: 44px;
        flex: 0 0 auto;
        place-items: center;
        border-radius: 13px;
        background: #edf2e9;
        color: var(--green);
        font-size: 1.2rem;
      }

      .stat-icon.warning {
        background: #fff4df;
        color: #a16c14;
      }

      .stat-icon.value {
        background: #edf0ff;
        color: #5964a7;
      }

      .stat-label {
        margin: 0 0 5px;
        color: var(--muted);
        font-size: 0.78rem;
      }

      .stat-value {
        margin: 0;
        font-size: 1.45rem;
        font-weight: 750;
        letter-spacing: -0.05em;
      }

      .inventory {
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: 15px;
        background: var(--surface);
        box-shadow: var(--shadow);
      }

      .inventory-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        padding: 20px 22px;
        border-bottom: 1px solid var(--line);
      }

      .inventory-title {
        margin: 0;
        font-size: 1rem;
        font-weight: 720;
      }

      .inventory-count {
        margin: 5px 0 0;
        color: var(--muted);
        font-size: 0.78rem;
      }

      .search-wrap {
        position: relative;
        width: min(100%, 280px);
      }

      .search-icon {
        position: absolute;
        top: 50%;
        left: 12px;
        color: var(--muted);
        transform: translateY(-50%);
      }

      .search {
        width: 100%;
        height: 40px;
        padding: 0 12px 0 36px;
        border: 1px solid var(--line);
        border-radius: 9px;
        outline: none;
        background: #fbfcfa;
        color: var(--ink);
        font-size: 0.82rem;
      }

      .search:focus,
      input:focus {
        border-color: #82a58d;
        box-shadow: 0 0 0 3px rgba(49, 93, 69, 0.1);
      }

      .table-wrap {
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
      }

      th,
      td {
        padding: 15px 22px;
        border-bottom: 1px solid #f0f1ee;
        white-space: nowrap;
      }

      th {
        background: #fafbf9;
        color: var(--muted);
        font-size: 0.69rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      td {
        font-size: 0.84rem;
      }

      tbody tr:last-child td {
        border-bottom: 0;
      }

      .product-cell {
        display: flex;
        align-items: center;
        gap: 11px;
        font-weight: 650;
      }

      .product-icon {
        display: grid;
        width: 36px;
        height: 36px;
        flex: 0 0 auto;
        place-items: center;
        border-radius: 10px;
        background: #f0f3ed;
        color: var(--green);
      }

      .stock-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 9px;
        border-radius: 99px;
        background: #edf5ed;
        color: #357143;
        font-size: 0.74rem;
        font-weight: 650;
      }

      .stock-pill.low {
        background: #fff3df;
        color: #9a6713;
      }

      .stock-pill.out {
        background: #fceaea;
        color: #ae3d3d;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 7px;
      }

      .icon-button {
        display: grid;
        width: 34px;
        height: 34px;
        place-items: center;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: white;
        color: #59615a;
      }

      .icon-button:hover {
        border-color: #bac9bb;
        background: #f6f8f4;
        color: var(--green);
      }

      .icon-button.delete:hover {
        border-color: #f0caca;
        background: #fff6f6;
        color: var(--red);
      }

      .empty-state,
      .loading-state {
        padding: 48px 20px;
        color: var(--muted);
        text-align: center;
        font-size: 0.87rem;
      }

      .empty-state strong {
        display: block;
        margin-bottom: 6px;
        color: var(--ink);
        font-size: 0.95rem;
      }

      .alert {
        display: none;
        margin-bottom: 18px;
        padding: 12px 15px;
        border: 1px solid #f0caca;
        border-radius: 10px;
        background: #fff6f6;
        color: #963a3a;
        font-size: 0.84rem;
      }

      .alert.visible {
        display: block;
      }

      .modal-backdrop {
        position: fixed;
        z-index: 5;
        display: none;
        padding: 20px;
        background: rgba(22, 31, 24, 0.48);
        inset: 0;
        place-items: center;
      }

      .modal-backdrop.open {
        display: grid;
      }

      .modal {
        width: min(100%, 470px);
        padding: 25px;
        border: 1px solid var(--line);
        border-radius: 17px;
        background: white;
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.19);
      }

      .modal-heading {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 23px;
      }

      .modal-heading h2 {
        margin: 0;
        font-size: 1.3rem;
        letter-spacing: -0.04em;
      }

      .modal-heading p {
        margin: 6px 0 0;
        color: var(--muted);
        font-size: 0.82rem;
      }

      .close-button {
        width: 34px;
        height: 34px;
        border: 0;
        border-radius: 8px;
        background: #f3f5f1;
        color: var(--muted);
        font-size: 1.1rem;
      }

      .field {
        display: grid;
        gap: 7px;
        margin-bottom: 16px;
      }

      .field label {
        font-size: 0.8rem;
        font-weight: 650;
      }

      .field input {
        width: 100%;
        height: 44px;
        padding: 0 12px;
        border: 1px solid #dfe4dd;
        border-radius: 9px;
        outline: none;
        background: white;
        color: var(--ink);
      }

      .field-hint {
        color: var(--muted);
        font-size: 0.74rem;
      }

      .modal-error {
        min-height: 20px;
        margin: 0 0 8px;
        color: var(--red);
        font-size: 0.8rem;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 9px;
        padding-top: 5px;
      }

      .secondary-button {
        min-height: 42px;
        padding: 0 15px;
        border: 1px solid var(--line);
        border-radius: 9px;
        background: white;
        color: var(--ink);
        font-size: 0.84rem;
        font-weight: 600;
      }

      .primary-button:disabled {
        cursor: wait;
        opacity: 0.65;
      }

      .toast {
        position: fixed;
        z-index: 10;
        right: 22px;
        bottom: 22px;
        padding: 13px 18px;
        border-radius: 10px;
        background: var(--ink);
        color: white;
        box-shadow: var(--shadow);
        font-size: 0.85rem;
        opacity: 0;
        pointer-events: none;
        transform: translateY(10px);
        transition: opacity 180ms ease, transform 180ms ease;
      }

      .toast.visible {
        opacity: 1;
        transform: translateY(0);
      }

      @media (max-width: 900px) {
        .layout {
          grid-template-columns: 190px minmax(0, 1fr);
        }

        .main {
          padding-right: 24px;
          padding-left: 24px;
        }

        .stats {
          gap: 10px;
        }

        .stat-card {
          gap: 10px;
          padding: 15px;
        }
      }

      @media (max-width: 650px) {
        .layout {
          display: block;
        }

        .sidebar {
          min-height: auto;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          padding: 13px 20px;
        }

        .brand {
          margin: 0;
        }

        .sidebar > nav,
        .sidebar-note {
          display: none;
        }

        .main {
          padding: 0 17px 28px;
        }

        .topbar {
          min-height: 62px;
        }

        .heading {
          align-items: flex-start;
          flex-direction: column;
          margin: 26px 0 20px;
        }

        .heading .primary-button {
          width: 100%;
        }

        .stats {
          grid-template-columns: 1fr;
          gap: 9px;
        }

        .stat-card {
          min-height: 82px;
          padding: 14px 16px;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
        }

        .stat-value {
          font-size: 1.25rem;
        }

        .inventory-head {
          align-items: stretch;
          flex-direction: column;
          padding: 17px;
        }

        .search-wrap {
          width: 100%;
        }

        th,
        td {
          padding: 13px 15px;
        }
      }
    </style>
  </head>
  <body>
    <div class="layout">
      <aside class="sidebar">
        <div class="brand"><span class="brand-mark">A</span> angel.</div>
        <nav aria-label="Navegación principal">
          <p class="nav-label">Menú</p>
          <a class="nav-item active" href="#inventory"><span class="nav-icon">▦</span> Inventario</a>
        </nav>
        <div class="sidebar-note">
          <strong>Tu tienda, en orden.</strong>
          Registra productos y revisa tus existencias desde un solo lugar.
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <div class="breadcrumb">Panel / <strong>Inventario</strong></div>
          <div class="user-chip"><span class="avatar">A</span> Angel</div>
        </header>

        <div class="content">
          <section class="heading">
            <div>
              <p class="eyebrow">Resumen de tienda</p>
              <h1>Inventario</h1>
              <p class="subtitle">Administra tus productos y mantén el stock al día.</p>
            </div>
            <button class="primary-button" id="new-product" type="button">
              <span aria-hidden="true">＋</span> Agregar producto
            </button>
          </section>

          <div class="alert" id="page-error" role="alert"></div>

          <section class="stats" aria-label="Resumen de inventario">
            <article class="stat-card">
              <span class="stat-icon">▦</span>
              <div><p class="stat-label">Productos registrados</p><p class="stat-value" id="stat-products">—</p></div>
            </article>
            <article class="stat-card">
              <span class="stat-icon warning">◷</span>
              <div><p class="stat-label">Unidades en stock</p><p class="stat-value" id="stat-units">—</p></div>
            </article>
            <article class="stat-card">
              <span class="stat-icon value">$</span>
              <div><p class="stat-label">Valor del inventario</p><p class="stat-value" id="stat-value">—</p></div>
            </article>
          </section>

          <section class="inventory" id="inventory" aria-labelledby="inventory-title">
            <div class="inventory-head">
              <div>
                <h2 class="inventory-title" id="inventory-title">Todos los productos</h2>
                <p class="inventory-count" id="inventory-count">Cargando inventario…</p>
              </div>
              <label class="search-wrap">
                <span class="search-icon" aria-hidden="true">⌕</span>
                <input class="search" id="search" type="search" placeholder="Buscar producto…" autocomplete="off" aria-label="Buscar productos" />
              </label>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Producto</th>
                    <th scope="col">Precio</th>
                    <th scope="col">Stock</th>
                    <th scope="col">Estado</th>
                    <th scope="col" style="text-align: right">Acciones</th>
                  </tr>
                </thead>
                <tbody id="product-list">
                  <tr><td class="loading-state" colspan="5">Cargando productos…</td></tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>

    <div class="modal-backdrop" id="product-modal" role="presentation">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-heading">
          <div>
            <h2 id="modal-title">Agregar producto</h2>
            <p>Completa los datos para actualizar el inventario.</p>
          </div>
          <button class="close-button" id="close-modal" type="button" aria-label="Cerrar">×</button>
        </div>
        <form id="product-form">
          <div class="field">
            <label for="product-name">Nombre del producto</label>
            <input id="product-name" name="nombre" type="text" maxlength="120" placeholder="Ej. Camiseta básica" required />
          </div>
          <div class="field">
            <label for="product-price">Precio</label>
            <input id="product-price" name="precio" type="number" min="0" step="0.01" placeholder="0.00" required />
            <span class="field-hint">Usa el precio de venta por unidad.</span>
          </div>
          <div class="field">
            <label for="product-stock">Cantidad disponible</label>
            <input id="product-stock" name="stock" type="number" min="0" step="1" placeholder="0" required />
          </div>
          <p class="modal-error" id="form-error" role="alert"></p>
          <div class="modal-actions">
            <button class="secondary-button" id="cancel-modal" type="button">Cancelar</button>
            <button class="primary-button" id="save-product" type="submit">Guardar producto</button>
          </div>
        </form>
      </section>
    </div>

    <div class="toast" id="toast" role="status" aria-live="polite"></div>
    <script src="app.js" defer></script>
  </body>
</html>
