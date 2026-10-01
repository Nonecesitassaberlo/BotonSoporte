async function main() {
  try {
    const res = await fetch("https://bureaumedellin.com/");
    const html = await res.text();
    const regex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    const imgs = [];
    while ((match = regex.exec(html)) !== null) {
      if (/logo|bureau/i.test(match[1])) {
        imgs.push(match[1]);
      }
    }
    console.log("Images found:", imgs);
    
    // Also look for inline svg
    if (html.includes("<svg")) {
      console.log("Found inline SVGs count:", (html.match(/<svg/g) || []).length);
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
