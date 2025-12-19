/* **************************************************************************** */
/* **************************************************************************** */
/* **************************************************************************** */
/* ************************ OFFICIAL WEBBYTE STUDIO TAG *********************** */
/* ******************************* do not touch ! ***************************** */
/* **************************************************************************** */
/* **************************************************************************** */
/* **************************************************************************** */


function webbytestudio() {

    const headerStyle =
        "background:#2a45f9;" +
        "color:#ffffff;" +
        "padding:8px 24px;" +
        "border-radius:16px;" +
        "font-family:Georgia,'Times New Roman',serif;" +
        "font-size:18px;" +
        "font-weight:700;" +
        "letter-spacing:0.12em;";

    const projectPillStyle =
        "background:#0b1120;" +
        "color:#ffffff;" +
        "padding:4px 10px;" +
        "border-radius:999px;" +
        "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;" +
        "font-size:12px;" +
        "font-weight:700;" +
        "border:1px solid #1f2937;" +
        "margin-top:0.35rem;";

    const resetStyle =
        "background:none;" +
        "color:inherit;" +
        "padding:0;" +
        "border-radius:0;" +
        "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;" +
        "font-size:0;";

    const versionStyle =
        "color:#4b5563;" +
        "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;" +
        "font-size:11px;" +
        "margin-top:0.35rem;";

    const lineStyle =
        "color:#3fb950;" +
        "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;" +
        "font-size:11px;" +
        "font-weight:700;";

    console.log(
        "%cWebByte Studio%c\n%c🔑 " + meta.id + "%c\n%c" + " " + meta.version + "\n%c -----------------------------------------------------",
        headerStyle,
        resetStyle,
        projectPillStyle,
        resetStyle,
        versionStyle,
        lineStyle
    );

}

/* **************************************************************************** */