define([
  'timetable_data',
  'backbone',
  'collections/ModuleCollection',
  'views/ModulesView',
  'collections/FilterCollection',
  'views/FiltersView'
],

function(timetable_data, Backbone, ModuleCollection, ModulesView, FilterCollection, FiltersView) {
  'use strict';

  var ModuleFinderView = Backbone.View.extend({
    initialize: function() {
      $('.exhibit-collectionView-header').on('click', '.add', function(evt) {
        var qtipContent;
        var itemID = $(this).data('code');
        if (this.collection.get(itemID)) {
          qtipContent = 'Already added!';
        } else {
          qtipContent = 'Added!';
          this.collection.add({
            id: itemID
          })
        }
        $(this).qtip({
          content: qtipContent,
          show: {
            event: false,
            ready: true
          },
          hide: {
            event: false,
            inactive: 1000
          }
        });
      });

      var sidebarShown = true;
      $('#sidebar-toggle').qtip({
        content: 'Hide Sidebar',
        position: {
          my: 'left center',
          at: 'top right'
        }
      }).click(function() {
        var qtipContent;
        $('#sidebar-toggle i').toggleClass('icon-chevron-left icon-chevron-right');
        $('#sidebar').animate({
          width: 'toggle'
        }, 100);
        $('#content').toggleClass('span12 span9');
        $('#content').toggleClass('no-sidebar');
        sidebarShown = !sidebarShown;
        qtipContent = sidebarShown ? 'Hide Sidebar' : 'Show Sidebar';
        $(this).qtip('option', 'content.text', qtipContent);
        return false;
      });

      $('.arrow-down, .arrow-right').click(function() {
        $(this)
            .toggleClass('arrow-down arrow-right')
            .siblings('ul').toggle();
      });

      function updateAncestors(el, checked) {
        var all = true;
        el.siblings().each(function() {
          all = $(this).children('input[type="checkbox"]')
              .prop('checked') === checked;
          return all;
        });
        if (all) {
          var grandparent = el.parent('ul').parent('li');
          if (grandparent.length) {
            grandparent.children('input[type="checkbox"]').prop({
              checked: checked,
              indeterminate: false
            });
            updateAncestors(grandparent, checked);
          }
        } else {
          el.parents('li').children('input[type="checkbox"]').prop({
            checked: false,
            indeterminate: true
          });
        }
      }

      $('#sidebar input[type="checkbox"]').click(function() {
        var checked = $(this).prop('checked'),
            parent = $(this).parent();
        parent.find('input[type="checkbox"]').prop({
          checked: checked,
          indeterminate: false
        });
        updateAncestors(parent, checked);
      });

      var filteredModules = new ModuleCollection();

      var modulesView = new ModulesView({collection: filteredModules});

      var filteredCodes = _.keys(timetable_data.mods);

      var begin = 0;

      _.each(filteredCodes.slice(begin, begin + 10), function(code) {
        filteredModules.add(_.extend(timetable_data.mods[code], { code: code }));
      });

      $(window).scroll(function() {
        if ($(window).scrollTop() + $(window).height() + 100 >= $(document).height()) {
          begin += 10;
          _.each(filteredCodes.slice(begin, begin + 10), function(code) {
            filteredModules.add(_.extend(timetable_data.mods[code], { code: code }));
          });
        }
      });

      var filters = new FilterCollection(
        _.map(['department', 'mc'], function(key) {
          return {
            filteredCollection: timetable_data.mods,
            key: key
          };
        }),
        {
          filteredCollection: filteredModules
        }
      );

      var filtersView = new FiltersView({collection: filters});
    }
  });

  return ModuleFinderView;
});