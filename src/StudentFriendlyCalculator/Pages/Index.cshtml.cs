using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using NCalc;
namespace StudentFriendlyCalculator.Pages;

[IgnoreAntiforgeryToken]
public class IndexModel : PageModel
{
    private readonly ILogger<IndexModel> _logger;

    public IndexModel(ILogger<IndexModel> logger)
    {
        _logger = logger;
    }

    public void OnGet()
    {

    }

    public class UserInput
    {
        public required string Name { get; set; }
    }

    //script for sending our return message from the input
    //the name is defined by its nature. Its an HTTP being sent to the backend, so it starts with "ON"
    //We used the POST method, so it continues to "OnPost"
    //Its name is NameSubmission, so we finish it as "OnPostNameSubmission"
    public IActionResult OnPostNameSubmission([FromBody] UserInput input)
    {
        Console.WriteLine("Received: " + input.Name); //debugging log so we can make sure it is getting things right
        string message = $"Hello, {input.Name}!"; //assembles a new string from our input
        return new JsonResult(new { message }); //returns the message as json data
    }


    public IActionResult OnPostCalcSubmission([FromBody] UserInput input)
    {
        Console.WriteLine("Received: " + input.Name); // The math expression

        if (string.IsNullOrWhiteSpace(input.Name))
        {
            return new JsonResult(new { error = "Expression cannot be empty." });
        }

        var expr = new Expression(input.Name);

        // Add support for constants like pi
        expr.EvaluateParameter += (name, args) =>
        {
            if (name.ToLower() == "pi")
                args.Result = Math.PI;
            if (name.ToLower() == "e")
                args.Result = Math.E;
        };

        try
        {
            var result = expr.Evaluate();
            Console.WriteLine($"Result: {result}");
            return new JsonResult(new { result });
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error: " + ex.Message);
            return new JsonResult(new { error = "Invalid expression: " + ex.Message });
        }
    }

}
