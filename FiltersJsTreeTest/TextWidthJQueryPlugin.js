$.fn.textWidth = function(){
        var self = $(this),
            children = self.children(),
            calculator = $('<span style="display: inline-block;">'),
            width;

        children.wrap(calculator);
        width = children.parent().width();
        return width;
    };