export async function getEntries() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = [
        {
          id: 1,
          title: "First Entry",
          content: "This is the first entry",
        },
        {
          id: 2,
          title: "Second Entry",
          content: "This is the second entry",
        },
        {
          id: 3,
          title: "Third Entry",
          content: "This is the third entry",
        },
      ];

      resolve(data);
    }, 2000); // Simulate a 2-second delay
  });
}
